import { createRef, PureComponent, RefObject } from "react";
import { DropCallbacks } from "./start";
import PropTypes from 'prop-types';
import { PreviewWithDataFile } from "../../pages/submit";
import { ClientContext } from "../ClientContext";
import Dropzone from "react-dropzone";
import { SearchMedia } from "../../pages/api/submitSearch";
import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";
import { BlurhashEncoder } from "../../helpers/BlurhashEncoder";
import { ImageEventContent, MatrixContents, ThumbnailData } from "../../helpers/event_types";

type ThumbnailableElement = HTMLImageElement | HTMLVideoElement;
type ThumbnailTransmissionData = {
    thumbnail_meta: ThumbnailData;
    thumbnail: Blob;
};
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
// Minimum size for image files before we generate a thumbnail for them.
const IMAGE_SIZE_THRESHOLD_THUMBNAIL = 1 << 15; // 32KB
// Minimum size improvement for image thumbnails, if both are not met then don't bother uploading thumbnail.
const IMAGE_THUMBNAIL_MIN_REDUCTION_SIZE = 1 << 16; // 1MB
const IMAGE_THUMBNAIL_MIN_REDUCTION_PERCENT = 0.1; // 10%

interface Props extends DropCallbacks, WithRouterProps {
    files: PreviewWithDataFile[];
};

type State = {
    currentFileIndex: number;
    hasSubmit: boolean;
    hasBack: boolean;
    [key: string]: any;
};
class MainSubmissionForm extends PureComponent<Props, State> {
    private image_refs: RefObject<HTMLImageElement>[] = [];
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentFileIndex: 0,
            hasSubmit: props.files.length === 1 ? true : false,
            hasBack: false
        };
        const range = [...Array(this.props.files.length).keys()]; // eslint-disable-line unicorn/new-for-builtins
        for (const index of range) {
            // @ts-ignore Its fine in the constructor
            this.state[`${index}_valid`] = false;
        }
    }
    static propTypes = {
        onDrop: PropTypes.func,
        onDropError: PropTypes.func,
        files: PropTypes.array,
        hasSubmit: PropTypes.bool,
        hasBack: PropTypes.bool
    };

    renderThumb() {
        const file = this.props.files[this.state.currentFileIndex];
        return (
            <div className="relative aspect-video w-full" style={{ height: "280px" }} key={file.name}>
                <img alt={file.name} className="w-full object-cover max-w-full align-bottom aspect-video" style={{ height: "280px" }} src={file.preview_url} />
            </div>
        );
    }

    renderThumbs() {
        return this.props.files.map((file, index) => {
            const setIndex = () => {
                if (this.props.files.length - 1 > index) {
                    const hasBack = index > 0 ? true : false;
                    this.setState({ currentFileIndex: index, hasBack, hasSubmit: false });
                } else if (this.props.files.length - 1 === index) {
                    const hasBack = index > 0 ? true : false;
                    this.setState({ currentFileIndex: index, hasBack, hasSubmit: true });
                }
            };

            const classes = () => {
                const classes_base = ["cursor-pointer", "aspect-video", "my-2"];

                if (this.state.currentFileIndex == index) {
                    classes_base.push("border", "p-2", "border-2", "border-white");
                } else if (this.state[`${index}_valid`]) {
                    classes_base.push("border", "p-2", "border-2", "border-teal-600");
                } else {
                    classes_base.push("border", "p-2", "border-2", "border-yellow-700");
                }
                return classes_base.join(" ");
            };

            if (!this.image_refs[index]) {
                this.image_refs[index] = createRef();
            }


            // TODO FIXME do make this work with keyboard presses!
            /* eslint-disable jsx-a11y/click-events-have-key-events */
            return (
                <div aria-label={file.name} className={classes.bind(this)()} onClick={setIndex} style={{ height: "144px" }} key={file.name} role="radio" tabIndex={index} aria-checked={this.state.currentFileIndex == index ? true : false}>
                    <img alt={file.name} ref={this.image_refs[index]} className="h-full w-full object-cover align-middle aspect-video" src={file.preview_url} />
                </div>
            );
            /* eslint-enable jsx-a11y/click-events-have-key-events */
        });
    }

    onNext(ev: { preventDefault: () => void; }) {
        ev.preventDefault();
        const newIndex = this.state.currentFileIndex + 1;
        if (this.props.files.length - 1 > newIndex) {
            const hasBack = newIndex > 0 ? true : false;
            this.setState({ currentFileIndex: newIndex, hasBack });
        } else if (this.props.files.length - 1 === newIndex) {
            this.setState({ currentFileIndex: newIndex, hasSubmit: true });
        }
    }

    onPrev(ev: { preventDefault: () => void; }) {
        ev.preventDefault();
        const newIndex = this.state.currentFileIndex - 1;
        if (this.props.files.length - 1 > newIndex) {
            const hasBack = newIndex > 0 ? true : false;
            this.setState({ currentFileIndex: newIndex, hasBack });
        } else if (this.props.files.length - 1 === newIndex) {
            this.setState({ currentFileIndex: newIndex, hasSubmit: true });
        }
    }


    async handleSubmit(event: { preventDefault: () => void; }) {
        const range = [...Array(this.props.files.length).keys()]; // eslint-disable-line unicorn/new-for-builtins
        const posts_for_search: SearchMedia[] = [];

        if (this.context.client.isGuest) {
            return;
        }

        // If any image is invalid do exit submit for now.
        // TODO show an error
        for (const index of range) {
            const valid = `${index}_valid`;
            if (!valid) {
                return;
            }
        }

        const ids = await this.doUpload();

        const thumbnails = await this.generateThumbnailsAndUpload();

        // Handle uploads
        for (const index of range) {
            console.log(index);
            console.log(this.context.client.profileRoomId);
            const title = `${index}_title`;
            const description = `${index}_description`;
            const tags = `${index}_tags`;
            const license = `${index}_license`;
            const nsfw = `${index}_nsfw`;
            const file = this.props.files[index];

            if (!this.context.client.profileRoomId) {
                return;
            }

            const event = {
                "m.text": this.state[title],
                "m.caption": [{
                    "m.text": this.state[title]
                }],
                "m.file": {
                    mimetype: file.type,
                    name: file.name,
                    url: ids[index].url,
                    size: file.size
                },
                "m.image": {
                    height: this.image_refs[index].current?.naturalHeight!,
                    width: this.image_refs[index].current?.naturalWidth!,
                },
                "matrixart.description": this.state[description],
                "matrixart.nsfw": this.state[nsfw] === "yes" ? true : false,
                "matrixart.license": this.state[license],
                "matrixart.tags": this.state[tags].split(",").map((x: string) => x.trimStart().trimEnd()),
            } as unknown as ImageEventContent;
            const thumbnailData = thumbnails.find(item => item.index == index);
            event["m.thumbnail"] = thumbnailData?.meta["m.thumbnail"];
            event["xyz.amorgan.blurhash"] = thumbnailData?.meta["xyz.amorgan.blurhash"]!;

            const event_id = await this.context.client.sendEvent(this.context.client.profileRoomId, 'm.image', event);

            posts_for_search.push({
                mxc_url: ids[index].url,
                event_id: event_id,
                title: this.state[title],
                description: this.state[description],
                tags: this.state[tags].trimStart().trimEnd(),
                nsfw: this.state[nsfw] === "yes" ? "true" : "false",
                license: this.state[license],
                sender: this.context.client.userId!
            });
        }
        const token = await this.context.client.getOpenidToken();
        await fetch("/api/submitSearch", { method: "POST", body: JSON.stringify({ access_token: token, user_id: this.context.client.userId, docs: posts_for_search }) });
        await this.props.router.replace("/");
    }

    // THis is aken from matrix-react-sdk commit efa1667d7e9de9e429a72396a5105d0219006db2
    private async createThumbnail(
        element: ThumbnailableElement,
        inputWidth: number,
        inputHeight: number,
        mimeType: string
    ): Promise<ThumbnailTransmissionData | undefined> {
        let targetWidth = inputWidth;
        let targetHeight = inputHeight;
        if (targetHeight > MAX_HEIGHT) {
            targetWidth = Math.floor(targetWidth * (MAX_HEIGHT / targetHeight));
            targetHeight = MAX_HEIGHT;
        }
        if (targetWidth > MAX_WIDTH) {
            targetHeight = Math.floor(targetHeight * (MAX_WIDTH / targetWidth));
            targetWidth = MAX_WIDTH;
        }

        let canvas: HTMLCanvasElement | OffscreenCanvas;
        let context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
        try {
            canvas = new window.OffscreenCanvas(targetWidth, targetHeight);
            context = canvas.getContext("2d");
        } catch {
            // Fallback support for other browsers (Safari and Firefox for now)
            canvas = document.createElement("canvas");
            (canvas as HTMLCanvasElement).width = targetWidth;
            (canvas as HTMLCanvasElement).height = targetHeight;
            context = canvas.getContext("2d");
        }

        if (!context) {
            return;
        }
        context?.drawImage(element, 0, 0, targetWidth, targetHeight);

        let thumbnailPromise: Promise<Blob | null>;

        if (window.OffscreenCanvas) {
            thumbnailPromise = (canvas as OffscreenCanvas).convertToBlob({ type: mimeType });
        } else {
            thumbnailPromise = new Promise<Blob | null>(resolve => (canvas as HTMLCanvasElement).toBlob(resolve, mimeType));
        }

        const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
        // thumbnailPromise and blurhash promise are being awaited concurrently
        const blurhash = await BlurhashEncoder.instance.getBlurhash(imageData);
        const thumbnail = await thumbnailPromise;
        if (!thumbnail) {
            return;
        }

        return {
            thumbnail_meta: {
                "m.thumbnail": [
                    {
                        width: targetWidth,
                        height: targetHeight,
                        mimetype: thumbnail.type,
                        size: thumbnail.size,
                        url: ""
                    }
                ],
                "xyz.amorgan.blurhash": blurhash,
            },
            thumbnail,
        };
    }

    private async generateThumbnailsAndUpload(): Promise<{ index: number; meta: ThumbnailData; }[]> {
        const thumbnails = [];
        if (!this.context.client.isGuest) {
            const range = [...Array(this.props.files.length).keys()]; // eslint-disable-line unicorn/new-for-builtins
            for (const index of range) {
                const file = this.props.files[index];
                const image = this.image_refs[index];
                const thumbnail_data = await this.createThumbnail(
                    image.current!,
                    image.current!.naturalWidth,
                    image.current!.naturalHeight,
                    file.type
                );
                if (!thumbnail_data) {
                    // TODO this causes issues
                    continue;
                }

                // we do all sizing checks here because we still rely on thumbnail generation for making a blurhash from.
                const sizeDifference = file.size - thumbnail_data.thumbnail_meta["m.thumbnail"]![0].size;
                if (
                    file.size <= IMAGE_SIZE_THRESHOLD_THUMBNAIL || // image is small enough already
                    (sizeDifference <= IMAGE_THUMBNAIL_MIN_REDUCTION_SIZE && // thumbnail is not sufficiently smaller than original
                        sizeDifference <= (file.size * IMAGE_THUMBNAIL_MIN_REDUCTION_PERCENT))
                ) {
                    delete thumbnail_data.thumbnail_meta["m.thumbnail"];
                    thumbnails.push({ index: index, meta: thumbnail_data.thumbnail_meta });
                }

                const result = await this.context.client.uploadFile(thumbnail_data.thumbnail);
                thumbnail_data.thumbnail_meta["m.thumbnail"]![0].url = result;
                thumbnails.push({ index: index, meta: thumbnail_data.thumbnail_meta });
            }
        }
        return thumbnails;
    }

    private async doUpload() {
        const urls = [];
        if (!this.context.client.isGuest) {
            const range = [...Array(this.props.files.length).keys()]; // eslint-disable-line unicorn/new-for-builtins
            for (const index of range) {
                const file = this.props.files[index];
                const result = await this.context.client.uploadFile(file);
                urls.push({ index: index, url: result });
            }
        }
        return urls;
    }

    componentDidUpdate() {
        const title = `${this.state.currentFileIndex}_title`;
        const description = `${this.state.currentFileIndex}_description`;
        const license = `${this.state.currentFileIndex}_license`;
        const nsfw = `${this.state.currentFileIndex}_nsfw`;
        let validated = false;
        if (this.state[title] && this.state[license] && this.state[description] && this.state[nsfw]) {
            validated = true;
        }
        this.setState({
            [`${this.state.currentFileIndex}_valid`]: validated
        } as State);
    }

    handleInputChange(event: { target: any; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = `${this.state.currentFileIndex}_${target.name}`;

        this.setState({
            [name]: value,
        } as State);
    }

    render() {
        return (
            <main className='min-h-full max-w-full flex flex-col justify-start items-center lg:pt-20 pt-52 z-0 bottom-0 relative mb-8'>
                <section className="flex flex-col items-start mb-4">
                    <div className="flex flex-row my-4 w-full items-center justify-center">
                        {this.renderThumb()}
                    </div>
                    <div className="flex flex-row w-full mb-4">
                        <form className="flex flex-col w-full">
                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Image Title</span>
                                <input required name="title" value={this.state[`${this.state.currentFileIndex}_title`] || ""} type="text" placeholder="Set an image title" className="min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Description</span>
                                <textarea name="description" value={this.state[`${this.state.currentFileIndex}_description`] || ""} placeholder="Description Text of the current image" className="min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Image Tags</span>
                                <input name="tags" type="text" value={this.state[`${this.state.currentFileIndex}_tags`] || ""} placeholder="Enter tags (Separate with a comma)" className="min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">License</span>
                                <select defaultValue="" required name="license" value={this.state[`${this.state.currentFileIndex}_license`] || ""} placeholder="Enter tags (Confirm by pressing enter)" className="min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                                    <option value="" disabled>Select an Creative Commons License</option>
                                    <option value="cc-by-4.0">Attribution 4.0 International (CC BY 4.0)</option>
                                    <option value="cc-by-sa-4.0">Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</option>
                                    <option value="cc-by-nc-4.0">Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</option>
                                    <option value="cc-by-nc-sa-4.0">Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</option>
                                    <option value="cc-by-nd-4.0">Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)</option>
                                    <option value="cc-by-nc-nd-4.0">Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)</option>
                                    <option value="CC0-1.0">CC0 1.0 Universal (CC0 1.0) Public Domain Dedication</option>
                                </select>
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Mature/NSFW Content?</span>
                                <select defaultValue="" required name="nsfw" value={this.state[`${this.state.currentFileIndex}_nsfw`] || ""} placeholder="Enter tags (Confirm by pressing enter)" className="min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                                    <option value="" disabled>Select Yes or No</option>
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </label>
                        </form>
                    </div>
                    <div className="flex justify-between w-full flex-row-reverse">
                        {
                            this.state.hasSubmit ?
                                <button className="text-base text-gray-900 dark:text-gray-200" onClick={this.handleSubmit.bind(this)}>Submit Posts</button>
                                :
                                <button className="text-base text-gray-900 dark:text-gray-200" onClick={this.onNext.bind(this)}>Next Image</button>
                        }
                        {this.state.hasBack ? <button className="text-base text-gray-900 dark:text-gray-200" onClick={this.onPrev.bind(this)}>Prev Image</button> : undefined}
                    </div>
                </section>
                {/* Warning for further readers. This css is easy to explode. Reasons are unknown. Dont touch it unless you know the fix! */}
                <section className="max-w-full flex flex-row justify-start items-start ">
                    <div className="overflow-x-auto mr-4 ml-8">
                        <div className="flex gap-1">
                            {this.renderThumbs()}
                        </div>
                    </div>
                    <Dropzone accept='image/*' onDropAccepted={this.props.onDrop} onDropRejected={this.props.onDropError}>
                        {({ getRootProps, getInputProps }) => (
                            <div className="my-2 flex aspect-square justify-center items-center border border-dashed dark:border-white border-black cursor-pointer h-[144px] w-[144px] mr-8" {...getRootProps()}>
                                <input {...getInputProps()} />
                                <svg className="dark:fill-gray-200 fill-gray-900" xmlns="http://www.w3.org/2000/svg" height="5rem" viewBox="0 0 24 24" width="5rem" fill="inherit"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                            </div>
                        )}
                    </Dropzone>
                </section>
            </main>
        );
    }
}


MainSubmissionForm.contextType = ClientContext;

// @ts-ignore Typescript is wrong
export default withRouter(MainSubmissionForm);
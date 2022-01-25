import { PureComponent } from "react";
import { DropCallbacks } from "./start";
import PropTypes from 'prop-types';
import { PreviewWithDataFile } from "../../pages/submit";
import { ClientContext } from "../ClientContext";
import Dropzone from "react-dropzone";

interface Props extends DropCallbacks {
    files: PreviewWithDataFile[];
};

type State = {
    currentFileIndex: number;
    hasSubmit: boolean;
    hasBack: boolean;
    [key: string]: any;
};
class MainSubmissionForm extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentFileIndex: 0,
            hasSubmit: props.files.length === 1 ? true : false,
            hasBack: false
        };
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
            <div className="relative" style={{ height: "280px" }} key={file.name}>
                <img alt={file.name} className="h-auto w-full object-cover max-w-full align-bottom" style={{ height: "280px" }} src={file.preview_url} />
            </div>
        );
    }

    renderThumbs() {
        return this.props.files.map((file, index) => {
            const setIndex = () => { this.setState({ currentFileIndex: index }); };
            // TODO FIXME do make this work with keyboard presses!

            /* eslint-disable jsx-a11y/click-events-have-key-events */
            return (
                <div aria-label={file.name} className="relative cursor-pointer w-auto aspect-video" onClick={setIndex} style={{ height: "140px" }} key={file.name} role="radio" tabIndex={index} aria-checked={this.state.currentFileIndex == index ? true : false}>
                    <img alt={file.name} className="h-auto w-full object-cover max-w-full align-bottom aspect-video" style={{ height: "140px" }} src={file.preview_url} />
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
        const range = [...Array(this.props.files.length - 1).keys()]; // eslint-disable-line unicorn/new-for-builtins
        for (const index of range) {
            const title = `${index}_title`;
            console.log(`${index}: ${this.state[title]}`);
            const description = `${index}_description`;
            console.log(`${index}: ${this.state[description]}`);
            const tags = `${index}_tags`;
            console.log(`${index}: ${this.state[tags]}`);
            const license = `${index}_license`;
            console.log(`${index}: ${this.state[license]}`);
            const nsfw = `${index}_nsfw`;
            console.log(`${index}: ${this.state[nsfw]}`);
        }
    }

    private async doUpload() {
        const urls = [];
        if (!this.context.client.isGuest) {
            for (const file of this.props.files) {
                const result = this.context.client.uploadFile(file);
                urls.push({ file_name: file.name, url: result });
            }
        }
        return urls;
    }

    handleInputChange(event: { target: any; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = `${this.state.currentFileIndex}_${target.name}`;
        this.setState({
            [name]: value
        } as State);
    }

    render() {
        return (
            <main className='min-h-full max-w-full flex flex-col justify-start items-center lg:pt-20 pt-52 z-0 bottom-0 relative mb-8'>
                <section className="flex flex-col items-start mb-4">
                    <div className="flex flex-row my-4">
                        {this.renderThumb()}
                    </div>
                    <div className="flex flex-row w-full mb-4">
                        <form className="flex flex-col w-full">
                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Image Title</span>
                                <input required name="title" value={this.state[`${this.state.currentFileIndex}_title`] || ""} type="text" placeholder="Set an image title" className="min-w-full placeholder:text-gray-900 text-gray-900" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Description</span>
                                <textarea name="description" value={this.state[`${this.state.currentFileIndex}_description`] || ""} placeholder="Description Text of the current image" className="min-w-full placeholder:text-gray-900 text-gray-900" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Image Tags</span>
                                <input name="tags" type="text" value={this.state[`${this.state.currentFileIndex}_tags`] || ""} placeholder="Enter tags (Separate with a comma)" className="min-w-full placeholder:text-gray-900 text-gray-900" onChange={this.handleInputChange.bind(this)} />
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">License</span>
                                <select required name="license" value={this.state[`${this.state.currentFileIndex}_license`] || ""} placeholder="Enter tags (Confirm by pressing enter)" className="min-w-full placeholder:text-gray-900 text-gray-900" onChange={this.handleInputChange.bind(this)}>
                                    <option value="" disabled selected>Select an Creative Commons License</option>
                                </select>
                            </label>

                            <span className="h-4"></span>

                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold">Mature/NSFW Content?</span>
                                <select required name="nsfw" value={this.state[`${this.state.currentFileIndex}_nsfw`] || ""} placeholder="Enter tags (Confirm by pressing enter)" className="min-w-full placeholder:text-gray-900 text-gray-900" onChange={this.handleInputChange.bind(this)}>
                                    <option value="" disabled selected>Select Yes or No</option>
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
                            <div className="flex aspect-square justify-center items-center border border-dashed dark:border-white border-black cursor-pointer h-[140px] w-[140px] mr-8" {...getRootProps()}>
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

export default MainSubmissionForm;
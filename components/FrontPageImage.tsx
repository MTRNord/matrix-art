import Link from "next/link";
import { PureComponent } from "react";
import { Blurhash } from "react-blurhash";
import { ImageEvent, ImageGalleryEvent, MatrixEventBase, MatrixImageEvents } from "../helpers/event_types";
import { constMatrixArtServer } from "../helpers/matrix_client";
import { ClientContext } from "./ClientContext";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import { i18n } from "next-i18next";

type Props = {
    event: MatrixImageEvents;
    imageHeight?: string;
    show_nsfw: boolean;
};

type State = {
    displayname: string;
    imageHeight?: string;
    error?: string;
};

export default class FrontPageImage extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            displayname: this.props.event.sender,
            imageHeight: this.props.imageHeight ? this.props.imageHeight : "270px"
        } as State;
    }

    static propTypes = {
        event: PropTypes.object,
        imageHeight: PropTypes.string,
        show_nsfw: PropTypes.bool
    };

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.error && this.state.error !== prevState.error) {
            toast(() => <div><h2 className="text-xl text-white">{i18n?.t("Error")}</h2><br />{this.state.error}</div>, {
                autoClose: false
            });
        }
    }

    async componentDidMount() {
        // auto-register as a guest if not logged in
        if (!this.context.client?.accessToken) {
            this.registerAsGuest();
        } else {
            console.log("Already logged in");
            if (!this.props.event) {
                return;
            }
            try {
                const profile = await this.context.client.getProfile(this.props.event.sender);
                this.setState({
                    displayname: profile.displayname,
                });
            } catch (error) {
                console.debug(`Failed to fetch profile for user ${this.props.event.sender}:`, error);
            }
        }

    }

    async registerAsGuest() {
        try {
            let serverUrl = constMatrixArtServer + "/_matrix/client";
            await this.context.client?.registerAsGuest(serverUrl);
            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to register as guest:", error);
            this.setState({
                error: "Failed to register as guest: " + JSON.stringify(error),
            });
        }
    }

    render() {
        const event = this.props.event;
        return (
            <>
                {isImageGalleryEvent(event) ? this.render_gallery(event) : (isImageEvent(event) ? this.render_image(event) : <div key={(event as MatrixEventBase).event_id}></div>)}
            </>
        );
    }


    render_gallery(event: ImageGalleryEvent) {
        const caption_text = event.content['m.caption'].filter(cap => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            const possible_text_caption = (cap as { "m.text": string; });
            return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") || possible_text_caption["m.text"];
        }).map(cap => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            const possible_text_caption = (cap as { "m.text": string; });
            return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") ? possible_html_caption.body : possible_text_caption["m.text"];
        })[0];
        return event.content['m.image_gallery'].map(image => {
            if (image["matrixart.nsfw"] && !this.props.show_nsfw) {
                return;
            }
            const thumbnail_url = image['m.thumbnail'] ? (image['m.thumbnail'].length > 0 ? image['m.thumbnail'][0].url : image['m.file'].url) : image['m.file'].url;
            return this.render_image_box(thumbnail_url, event.event_id + image['m.file'].url, event.event_id, caption_text, image['m.image'].height, image['m.image'].width, image["xyz.amorgan.blurhash"]);
        });
    }


    render_image(event: ImageEvent) {
        if (event.content["matrixart.nsfw"] && !this.props.show_nsfw) {
            return;
        }
        const caption_text = event.content['m.caption'].filter(cap => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            const possible_text_caption = (cap as { "m.text": string; });
            return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") || possible_text_caption["m.text"];
        }).map(cap => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            const possible_text_caption = (cap as { "m.text": string; });
            return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") ? possible_html_caption.body : possible_text_caption["m.text"];
        })[0];
        const thumbnail_url = event.content['m.thumbnail'] ? (event.content['m.thumbnail'].length > 0 ? event.content['m.thumbnail'][0].url : event.content['m.file'].url) : event.content['m.file'].url;
        return this.render_image_box(thumbnail_url, event.event_id, event.event_id, caption_text, event.content['m.image'].height, event.content['m.image'].width, event.content["xyz.amorgan.blurhash"]);
    }

    render_image_box(thumbnail_url: string, id: string, post_id: string, caption: string, h: number, w: number, blurhash?: string) {
        // TODO show creators display name instead of mxid and show avatar image
        // TODO proper alt text
        const direct_link = `/post/${encodeURIComponent(post_id)}`;
        const image = blurhash ? (
            <div className="flex">
                <Blurhash
                    hash={blurhash}
                    height={this.state.imageHeight}
                    width="100%"
                />
                <img loading="lazy" width={w} height={h} alt={caption} title={caption} style={{ height: this.state.imageHeight }} className="h-auto w-full relative -ml-[100%] max-w-full object-cover align-bottom" src={this.context.client?.thumbnailLink(thumbnail_url, "scale", Number.parseInt(this.state.imageHeight?.replace("px", "")!), Number.parseInt(this.state.imageHeight?.replace("px", "")!))}></img>
            </div>
        ) : (
            <img alt={caption} width={w} height={h} title={caption} style={{ height: this.state.imageHeight }} className={`h-auto w-full relative max-w-full object-cover align-bottom z-0`} src={this.context.client?.thumbnailLink(thumbnail_url, "scale", Number.parseInt(this.state.imageHeight?.replace("px", "")!), Number.parseInt(this.state.imageHeight?.replace("px", "")!))}></img>
        );
        return (
            <li style={{ height: this.state.imageHeight }} key={id}>
                <Link href={direct_link} passHref>
                    <div style={{ height: this.state.imageHeight }} className={`relative cursor-pointer`}>
                        {image}
                        <div style={{ height: this.state.imageHeight }} className={`flex-col max-w-full opacity-0 hover:opacity-100 duration-300 absolute bg-gradient-to-b from-transparent to-black/[.25] inset-0 z-10 flex justify-end items-start text-white p-4`}>
                            <h2 className='truncate max-w-full text-base font-semibold'>{caption}</h2>
                            <p className='truncate max-w-full text-sm'>{this.state.displayname}</p>
                        </div>
                    </div>
                </Link>
            </li>
        );
    }
}
FrontPageImage.contextType = ClientContext;

// TODO also render the edits properly later on
export function isImageGalleryEvent(event: MatrixImageEvents): event is ImageGalleryEvent {
    return event.type === "m.image_gallery" && !event.unsigned?.redacted_because;
}


export function isImageEvent(event: MatrixImageEvents): event is ImageEvent {
    return event.type === "m.image" && !event.unsigned?.redacted_because;
};
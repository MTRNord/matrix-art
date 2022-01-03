import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component, ReactNode } from "react";
import { RingLoader } from "react-spinners";
import { ClientContext } from "../../components/ClientContext";
import Header from "../../components/Header";
import { ImageEvent, ImageGalleryEvent, MatrixEventBase, MatrixImageEvents } from "../../helpers/event_types";
import { constMatrixArtServer } from "../../helpers/matrix_client";
import { get_data } from "../api/directory";
import { isImageEvent, isImageGalleryEvent } from '../../components/FrontPageImage';
import Link from 'next/link';

const centerSpinner = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
};

type State = {
    hasFullyLoaded: boolean;
    isLoadingImages: boolean;
    image_event?: MatrixImageEvents;
    displayname?: string;
    error?: any;
};

class Post extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            hasFullyLoaded: false,
            isLoadingImages: false
        };
    }

    async componentDidMount() {
        if (!this.context.client?.accessToken) {
            try {
                let serverUrl = constMatrixArtServer + "/_matrix/client";
                await this.context.client?.registerAsGuest(serverUrl);
            } catch (err) {
                console.error("Failed to register as guest:", err);
            }
        } else {
            console.log("Already logged in");
        }
        if (this.props.directory_data && this.props.event_id && this.props.event_id.startsWith("$")) {
            await this.loadEvent(this.props.event_id);
        }
    }

    async loadEvent(event_id: string) {
        const { hasFullyLoaded, isLoadingImages } = this.state;
        if (isLoadingImages || hasFullyLoaded || !this.props.directory_data) {
            return;
        }
        this.setState({
            isLoadingImages: true,
        });
        try {
            // TODO fix this. It is super inefficent.
            for (let user of this.props.directory_data) {
                // We dont need many events
                const roomId = await this.context.client?.followUser(user.user_room);
                await this.context.client?.getTimeline(roomId, 100, async (events) => {
                    // Filter events by type
                    const image_event = events.filter((event) => (event.type === "m.image_gallery" || event.type === "m.image") && event.event_id === event_id);
                    try {
                        const profile = await this.context.client.getProfile(image_event[0].sender);
                        this.setState({
                            image_event: image_event[0],
                            displayname: profile.displayname,
                        });
                    } catch (ex) {
                        console.debug(`Failed to fetch profile for user ${image_event[0].sender}:`, ex);
                        this.setState({
                            image_event: image_event[0],
                            displayname: image_event[0].sender,
                        });
                    }
                });
            }
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
            });
        } finally {
            this.setState({
                isLoadingImages: false,
                hasFullyLoaded: true
            });
        }
    }

    render() {
        const { error, hasFullyLoaded, image_event } = this.state;

        if (!hasFullyLoaded) {
            return (
                <div className="flex h-screen">
                    <div className="m-auto">
                        <RingLoader css={centerSpinner} size={150} color={"#123abc"} loading={!hasFullyLoaded} />
                    </div>
                </div>
            );
        }

        if (!this.props.event_id || !this.props.event_id?.startsWith("$")) {
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='h-full lg:pt-[108px] pt-[216px] z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The Post you wanted does not exist!</h1>
                    </main>
                </div>
            );
        }

        if (image_event) {
            let post_title = "";
            const caption = image_event.content['m.caption'].filter((cap) => {
                const possible_html_caption = (cap as { body: string; mimetype: string; });
                return possible_html_caption.body !== undefined && possible_html_caption.mimetype === "text/html";
            });
            if (caption.length != 0) {
                post_title = (caption[0] as { body: string; mimetype: string; }).body;
            }
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | {post_title}</title>
                        <meta property="og:title" content={`Matrix Art | ${post_title}`} key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content={`Matrix Art | ${post_title}`} key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>

                    <main className='flex-col h-full flex lg:pt-[108px] pt-[216px] z-0'>
                        {isImageGalleryEvent(image_event) ? this.renderImageGalleryEvent(image_event, post_title) : isImageEvent(image_event) ? this.renderSingleImageEvent(image_event, post_title) : <div key={(image_event as MatrixEventBase).event_id}></div>}
                        <div className="grow bg-[#f8f8f8] dark:bg-[#06070D] min-h-[400px] flex flex-col items-center">
                            <div className="flex flex-col items-start lg:min-w-[60rem] lg:w-[60rem]">
                                <h1 className="my-4 text-6xl text-gray-900 dark:text-gray-200 font-bold">{post_title}</h1>
                                <Link href={"/profile/" + encodeURIComponent(image_event.sender)}><h3 className="cursor-pointer mt-0 mb-4 text-l text-gray-900 dark:text-gray-200 font-normal">{this.state.displayname}</h3></Link>
                                {isImageGalleryEvent(image_event) ? this.renderImageGalleryTags(image_event) : isImageEvent(image_event) ? this.renderSingleImageTags(image_event) : <div key={(image_event as MatrixEventBase).event_id + "tags"}></div>}
                            </div>
                        </div>
                    </main>
                </div>
            );
        } else if (error) {
            return (
                <div>Error: {error.message}</div>
            );
        } else {
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='h-full lg:pt-[108px] pt-[216px] z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The Post you wanted does not exist!</h1>
                    </main>
                </div>
            );
        }

    }
    renderSingleImageTags(imageEvent: ImageEvent): ReactNode {
        const tags = imageEvent.content["matrixart.tags"].map((tag) => {
            return <div className="mr-2 bg-slate-800 hover:bg-slate-600 p-2 rounded-sm cursor-default" key={(imageEvent as MatrixEventBase).event_id + "tags" + tag}>{tag}</div>;
        });
        return (
            <div className="flex flex-row items-center text-gray-200 font-medium" key={(imageEvent as MatrixEventBase).event_id + "tags"}>{tags}</div>
        );
    }

    renderImageGalleryTags(imageEvent: ImageGalleryEvent): ReactNode {
        const tags = imageEvent.content['m.image_gallery'].flatMap(image => {
            return image['matrixart.tags'].map((tag) => {
                return <div className="mr-2 bg-slate-800 hover:bg-slate-600 p-2 rounded-sm cursor-default" key={(imageEvent as MatrixEventBase).event_id + "tags" + tag}>{tag}</div>;
            });
        });
        return (
            <div className="flex flex-row items-center text-gray-200 font-medium" key={(imageEvent as MatrixEventBase).event_id + "tags"}>{tags}</div>
        );
    }

    renderSingleImageEvent(imageEvent: ImageEvent, caption: string) {
        const url = this.context.client?.downloadLink(imageEvent.content["m.file"].url);
        const thumbnail_url = this.context.client?.downloadLink(imageEvent.content['m.thumbnail'][0].url);

        if (!url || !thumbnail_url) {
            return <></>;
        }
        return (
            <>
                <Head>
                    <meta property="og:image" content={url} key="og-image" />
                    <meta property="og:image:type" content={imageEvent.content["m.file"].mimetype} key="og-image-type" />
                    <meta property="og:image:alt" content={caption} key="og-image-alt" />
                    <meta property="og:image:width" content={imageEvent.content["m.image"].width.toString()} key="og-image-width" />
                    <meta property="og:image:height" content={imageEvent.content["m.image"].height.toString()} key="og-image-height" />
                    <meta name="twitter:image" content={url} key="og-twitter-image" />
                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <LightGallery
                        plugins={[lgThumbnail, lgZoom]}
                        elementClassNames="shadow-2xl max-w-full lg:max-w-3xl max-h-[871px] shadow-black cursor-zoom-in"
                        key={imageEvent.event_id}
                        thumbnail={true}
                    >
                        <a href={url} title={caption} data-src={url}>
                            <img alt={caption} title={caption} src={thumbnail_url} />
                        </a>
                    </LightGallery>
                </div>
            </>
        );
    }

    renderImageGalleryEvent(imageEvent: ImageGalleryEvent, caption: string) {
        const images = imageEvent.content['m.image_gallery'].map(image => {
            const url = this.context.client?.downloadLink(image["m.file"].url);
            const thumbnail_url = this.context.client?.downloadLink(image['m.thumbnail'][0].url);
            if (!url || !thumbnail_url) {
                return <></>;
            }
            return (
                <a key={url} href={url} title={caption} data-src={url}>
                    <img alt={caption} title={caption} src={thumbnail_url} />
                </a>
            );
        });
        return (
            <>
                <Head>
                    <meta property="og:image" content={imageEvent.content["m.image_gallery"][0]["m.file"].url} key="og-image" />
                    <meta property="og:image:type" content={imageEvent.content["m.image_gallery"][0]["m.file"].mimetype} key="og-image-type" />
                    <meta property="og:image:alt" content={caption} key="og-image-alt" />
                    <meta property="og:image:width" content={imageEvent.content["m.image_gallery"][0]["m.image"].width.toString()} key="og-image-width" />
                    <meta property="og:image:height" content={imageEvent.content["m.image_gallery"][0]["m.image"].height.toString()} key="og-image-height" />
                    <meta name="twitter:image" content={imageEvent.content["m.image_gallery"][0]["m.file"].url} key="og-twitter-image" />
                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <LightGallery
                        plugins={[lgThumbnail, lgZoom]}
                        elementClassNames="shadow-2xl max-w-full lg:max-w-3xl max-h-[871px] shadow-black cursor-zoom-in"
                        key={imageEvent.event_id}
                        thumbnail={true}
                    >
                        {images}
                    </LightGallery>
                </div>
            </>
        );
    }

}

Post.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query, res } = context;
    const event_id = decodeURIComponent(query.id as string);

    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    if (event_id && event_id.startsWith("$")) {
        try {
            const data = await get_data();


            return {
                props: {
                    directory_data: data, event_id: event_id
                }
            };
        } catch (error) {
            return { notFound: true, props: {} };
        }
    }
    return { notFound: true, props: {} };

};
export default withRouter(Post);
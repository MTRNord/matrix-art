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
import { isImageEvent, isImageGalleryEvent } from "../Home";

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
    image_event: MatrixImageEvents;
    error?: any;
};

class Post extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            hasFullyLoaded: false,
            isLoadingImages: false
        } as State;
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
                await this.context.client?.getTimeline(roomId, 100, (events) => {
                    // Filter events by type
                    const image_event = events.filter((event) => (event.type === "m.image_gallery" || event.type === "m.image") && event.event_id === event_id);
                    this.setState({
                        image_event: image_event[0],
                    });
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
                                <h3 className="my-4 text-l text-gray-900 dark:text-gray-200 font-normal">{image_event.sender}</h3>
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
    renderSingleImageTags(image_event: ImageEvent): ReactNode {
        const tags = image_event.content["matrixart.tags"].map((tag) => {
            return <div className="mr-2 bg-slate-800 hover:bg-slate-600 p-2 rounded-sm cursor-default" key={(image_event as MatrixEventBase).event_id + "tags" + tag}>{tag}</div>;
        });
        return (
            <div className="flex flex-row items-center text-gray-900 dark:text-gray-200 font-medium" key={(image_event as MatrixEventBase).event_id + "tags"}>{tags}</div>
        );
    }

    renderImageGalleryTags(image_event: ImageGalleryEvent): ReactNode {
        return <></>;
    }

    renderSingleImageEvent(imageEvent: ImageEvent, caption: string) {
        const url = this.context.client?.downloadLink(imageEvent.content["m.file"].url);

        if (!url) {
            return <></>;
        }
        return this.renderImage(imageEvent.event_id,
            url,
            caption,
            imageEvent.content["m.file"].mimetype,
            imageEvent.content["m.image"].width,
            imageEvent.content["m.image"].height
        );
    }

    renderImageGalleryEvent(imageEvent: ImageGalleryEvent, caption: string) {
        return <div></div>;
    }

    // TODO make full size on click
    renderImage(id: string, src: string, caption: string, mime: string, w: number, h: number) {
        // TODO proper alt
        return (
            <>
                <Head>
                    <meta property="og:image" content={src} key="og-image" />
                    <meta property="og:image:type" content={mime} key="og-image-type" />
                    <meta property="og:image:alt" content={caption} key="og-image-alt" />
                    <meta property="og:image:width" content={w.toString()} key="og-image-width" />
                    <meta property="og:image:height" content={h.toString()} key="og-image-height" />
                    <meta name="twitter:image" content={src} key="og-twitter-image" />
                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <img alt={caption} title={caption} className="shadow-2xl max-w-full lg:max-w-3xl max-h-[871px] shadow-black cursor-zoom-in" src={src} key={id}></img>
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
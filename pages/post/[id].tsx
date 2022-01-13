import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { PureComponent, ReactNode } from "react";
import { client, ClientContext } from "../../components/ClientContext";
import Header from "../../components/Header";
import { ImageEvent, ImageGalleryEvent, MatrixEventBase, MatrixImageEvents } from "../../helpers/event_types";
import { constMatrixArtServer } from "../../helpers/matrix_client";
import { get_data } from "../api/directory";
import { isImageEvent, isImageGalleryEvent } from '../../components/FrontPageImage';
import Link from 'next/link';
import Footer from '../../components/Footer';

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

class Post extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            hasFullyLoaded: props.hasFullyLoaded,
            image_event: props.image_event,
            displayname: props.displayname,
            isLoadingImages: false
        };
    }

    async componentDidMount() {
        if (!this.context.client?.accessToken) {
            try {
                let serverUrl = constMatrixArtServer + "/_matrix/client";
                await this.context.client?.registerAsGuest(serverUrl);
                await this.context.guest_client?.registerAsGuest(serverUrl);
            } catch (error) {
                console.error("Failed to register as guest:", error);
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
                const events = await this.context.client?.getTimeline(roomId, 100); // Filter events by type
                const image_event = events.find((event) => (event.type === "m.image_gallery" || event.type === "m.image") && event.event_id === event_id);
                if (image_event == undefined) {
                    continue;
                }
                try {
                    const profile = await this.context.client.getProfile(image_event.sender);
                    this.setState({
                        image_event: image_event as MatrixImageEvents,
                        displayname: profile.displayname,
                    });

                } catch (error) {
                    console.debug(`Failed to fetch profile for user ${image_event.sender}:`, error);
                    this.setState({
                        image_event: image_event as MatrixImageEvents,
                        displayname: image_event.sender,
                    });
                }
            }
        } catch (error) {
            this.setState({
                error: JSON.stringify(error),
            });
        } finally {
            this.setState({
                isLoadingImages: false,
                hasFullyLoaded: true
            });
        }
    }

    render() {
        const { error, hasFullyLoaded, image_event, displayname } = this.state;

        if (!hasFullyLoaded) {
            return (
                <div className='h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='w-full lg:pt-20 pt-52 z-0'>
                        <div className="m-0 w-full">
                            <div className="loader fixed top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]">Loading...</div>
                        </div>
                    </main>
                </div>
            );
        }

        if (!this.props.event_id || !this.props.event_id?.startsWith("$")) {
            return (
                <div className="h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The Post you wanted does not exist!</h1>
                    </main>
                    <Footer></Footer>
                </div>
            );
        }

        if (image_event) {
            let post_title = "";
            const caption = image_event.content['m.caption'].filter((cap) => {
                const possible_html_caption = (cap as { body: string; mimetype: string; });
                return possible_html_caption.body !== undefined && possible_html_caption.mimetype === "text/html";
            });
            if (caption.length > 0) {
                post_title = (caption[0] as { body: string; mimetype: string; }).body;
            }
            return (
                <div className="h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | {post_title}</title>
                        <meta property="og:title" content={`Matrix Art | ${post_title}`} key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content={`Matrix Art | ${post_title}`} key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                        <meta name="author" content={displayname} />
                        <meta name="citation_authors" content={displayname} />
                        <meta name="citation_journal_title" content="Matrix-Art" />
                    </Head>
                    <Header></Header>

                    <main className='flex-col mb-auto flex lg:pt-20 pt-56 z-0'>
                        {isImageGalleryEvent(image_event) ? this.renderImageGalleryEvent(image_event, post_title) : (isImageEvent(image_event) ? this.renderSingleImageEvent(image_event, post_title) : <div key={(image_event as MatrixEventBase).event_id}></div>)}
                        <div className="grow bg-[#f8f8f8] dark:bg-[#06070D] min-h-[25rem] flex flex-col items-center">
                            <div className="flex flex-col items-start lg:min-w-[60rem] lg:w-[60rem]">
                                <h1 className="my-4 text-6xl text-gray-900 dark:text-gray-200 font-bold">{post_title}</h1>
                                <h3 className="cursor-pointer mt-0 mb-4 text-l text-gray-900 dark:text-gray-200 font-normal"><Link href={"/profile/" + encodeURIComponent(image_event.sender)}>{displayname}</Link></h3>
                                {isImageGalleryEvent(image_event) ? this.renderImageGalleryTags(image_event) : (isImageEvent(image_event) ? this.renderSingleImageTags(image_event) : <div key={(image_event as MatrixEventBase).event_id + "tags"}></div>)}
                            </div>
                        </div>
                    </main>
                    <Footer></Footer>
                </div>
            );
        } else if (error) {
            return (
                <div>Error: {error.message}</div>
            );
        } else {
            return (
                <div className="h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The Post you wanted does not exist!</h1>
                    </main>
                    <Footer></Footer>
                </div>
            );
        }

    }

    renderTags(tags: string[], event_id: string) {
        return tags.map((tag) => {
            return <div className="cursor-pointer mr-2 bg-slate-800 hover:bg-slate-600 p-2 rounded-sm" key={event_id + "tags" + tag}>{tag}</div>;
        });
    }

    renderSingleImageTags(imageEvent: ImageEvent): ReactNode {
        const tags = this.renderTags(imageEvent.content["matrixart.tags"], (imageEvent as MatrixEventBase).event_id);
        return (
            <div className="flex flex-row items-center text-gray-200 font-medium" key={(imageEvent as MatrixEventBase).event_id + "tags"}>{tags}</div>
        );
    }

    renderImageGalleryTags(imageEvent: ImageGalleryEvent): ReactNode {
        const tags = imageEvent.content['m.image_gallery'].flatMap(image => {
            return this.renderTags(image["matrixart.tags"], (imageEvent as MatrixEventBase).event_id);
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
        const metadata = {
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            contentUrl: url,
            // TODO get this from the event itself
            license: "https://creativecommons.org/licenses/by-nc-nd/4.0/"
        };
        return (
            <>
                <Head>
                    <meta property="og:image" content={url} key="og-image" />
                    <meta property="og:image:type" content={imageEvent.content["m.file"].mimetype} key="og-image-type" />
                    <meta property="og:image:alt" content={caption} key="og-image-alt" />
                    <meta property="og:image:width" content={imageEvent.content["m.image"].width.toString()} key="og-image-width" />
                    <meta property="og:image:height" content={imageEvent.content["m.image"].height.toString()} key="og-image-height" />
                    <meta name="twitter:image" content={url} key="og-twitter-image" />
                    <script type="application/ld+json">
                        {JSON.stringify(metadata)}
                    </script>

                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <LightGallery
                        plugins={[lgThumbnail, lgZoom]}
                        elementClassNames="shadow-2xl max-w-full lg:max-w-3xl max-h-[54.25rem] shadow-black cursor-zoom-in"
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
        const metadata: { "@context": string; "@type": string; contentUrl: string; license: string; }[] = [];
        const images = imageEvent.content['m.image_gallery'].map(image => {
            const url = this.context.client?.downloadLink(image["m.file"].url);
            const thumbnail_url = this.context.client?.downloadLink(image['m.thumbnail'][0].url);
            if (!url || !thumbnail_url) {
                return <></>;
            }
            metadata.push({
                "@context": "https://schema.org/",
                "@type": "ImageObject",
                contentUrl: url,
                // TODO get this from the event itself
                license: "https://creativecommons.org/licenses/by-nc-nd/4.0/"
            });
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
                    <script type="application/ld+json">
                        {JSON.stringify(metadata)}
                    </script>
                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <LightGallery
                        plugins={[lgThumbnail, lgZoom]}
                        elementClassNames="shadow-2xl max-w-full lg:max-w-3xl max-h-[54.25rem] shadow-black cursor-zoom-in"
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
            if (!client?.accessToken) {
                try {
                    let serverUrl = constMatrixArtServer + "/_matrix/client";
                    await client?.registerAsGuest(serverUrl);
                } catch (error) {
                    console.error("Failed to register as guest:", error);
                    return {
                        props: {
                            directory_data: data,
                            event_id: event_id,
                            hasFullyLoaded: false,
                        }
                    };
                }
            }
            // TODO fix this. It is super inefficent.
            for (let user of data) {
                // TODO check what happens if this is a non public image.
                // We dont need many events
                const roomId = await client?.followUser(user.user_room);
                const events = await client?.getTimeline(roomId, 100);
                // Filter events by type
                const image_event = events.find((event) => (event.type === "m.image_gallery" || event.type === "m.image") && event.event_id === event_id);
                if (image_event == undefined) {
                    continue;
                }
                try {
                    const profile = await client.getProfile(image_event.sender);
                    return {
                        props: {
                            directory_data: data,
                            image_event: image_event as MatrixImageEvents,
                            event_id: event_id,
                            hasFullyLoaded: true,
                            displayname: profile.displayname
                        }
                    };
                } catch (error) {
                    console.debug(`Failed to fetch profile for user ${image_event.sender}:`, error);
                    return {
                        props: {
                            directory_data: data,
                            image_event: image_event as MatrixImageEvents,
                            event_id: event_id,
                            hasFullyLoaded: true,
                            displayname: image_event.sender
                        }
                    };
                }
            }


            return {
                props: {
                    directory_data: data,
                    event_id: event_id,
                    hasFullyLoaded: false,
                }
            };
        } catch {
            return { notFound: true, props: {} };
        }
    }
    return { notFound: true, props: {} };

};
export default withRouter(Post);
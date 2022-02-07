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
import { Blurhash } from 'react-blurhash';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { i18n } from 'next-i18next';
import { toast } from 'react-toastify';

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
};

type State = {
    hasFullyLoaded: boolean;
    isLoadingImages: boolean;
    image_event?: MatrixImageEvents;
    error?: string;
    displayname: string;
    avatar_url?: string;
};

class Post extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            hasFullyLoaded: props.hasFullyLoaded,
            image_event: props.image_event,
            displayname: props.displayname,
            isLoadingImages: false,
            avatar_url: props.avatar_url
        };
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.error && this.state.error !== prevState.error) {
            toast.dismiss();
            toast(() => <div><h2 className="text-xl text-white">{i18n?.t("Error")}</h2><br />{this.state.error}</div>, {
                autoClose: false
            });
        }
    }

    async componentDidMount() {
        if (!this.context.client?.accessToken) {
            try {
                let serverUrl = constMatrixArtServer + "/_matrix/client";
                await this.context.client?.registerAsGuest(serverUrl);
            } catch (error) {
                console.error("Failed to register as guest:", error);
            }
        } else {
            console.log("Already logged in");
        }
        if (!this.context.guest_client?.accessToken) {
            try {
                let serverUrl = constMatrixArtServer + "/_matrix/client";
                await this.context.guest_client?.registerAsGuest(serverUrl);
            } catch (error) {
                console.error("Failed to register as guest:", error);
            }
        } else {
            console.log("Guest Already logged in");
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
        console.log("hi");
        const client = this.context.client.isGuest ? this.context.client : this.context.guest_client;
        this.setState({
            isLoadingImages: true,
        });
        try {
            // TODO fix this. It is super inefficient.
            for (let user of this.props.directory_data) {
                // We dont need many events
                let roomId;
                try {
                    roomId = await client?.followUser(user.public_user_room);
                } catch {
                    console.error("Unbable to join room");
                    continue;
                }
                const events = await client?.getTimeline(roomId, 100); // Filter events by type
                const image_event = events.find((event) => (event.type === "m.image_gallery" || event.type === "m.image") && event.event_id === event_id);
                if (image_event == undefined) {
                    continue;
                }
                try {
                    const profile = await client.getProfile(image_event.sender);
                    this.setState({
                        image_event: image_event as MatrixImageEvents,
                        displayname: profile.displayname || image_event.sender,
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

    getLicenseUrl(license_type: string): string {
        switch (license_type) {
            case "cc-by-4.0":
                return "https://creativecommons.org/licenses/by/4.0/";
            case "cc-by-sa-4.0":
                return "https://creativecommons.org/licenses/by-sa/4.0/";
            case "cc-by-nc-4.0":
                return "https://creativecommons.org/licenses/by-nc/4.0/";
            case "cc-by-nc-sa-4.0":
                return "https://creativecommons.org/licenses/by-nc-sa/4.0/";
            case "cc-by-nd-4.0":
                return "https://creativecommons.org/licenses/by-nd/4.0/";
            case "cc-by-nc-nd-4.0":
                return "https://creativecommons.org/licenses/by-nc-nd/4.0/";
            case "CC0-1.0":
                return "https://creativecommons.org/publicdomain/zero/1.0/";
            default:
                return "";
        }
    }

    getLicenseName(license_type: string): string {
        switch (license_type) {
            case "cc-by-4.0":
                return "Attribution 4.0 International (CC BY 4.0)";
            case "cc-by-sa-4.0":
                return "Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)";
            case "cc-by-nc-4.0":
                return "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)";
            case "cc-by-nc-sa-4.0":
                return "Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)";
            case "cc-by-nd-4.0":
                return "Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)";
            case "cc-by-nc-nd-4.0":
                return "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)";
            case "CC0-1.0":
                return "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication";
            default:
                return "Unknown License";
        }
    }

    render() {
        const { hasFullyLoaded, image_event, displayname, avatar_url } = this.state;

        if (!hasFullyLoaded) {
            return (
                <div className='min-h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                    <Head>
                        <title key="title">Matrix Art | {i18n?.t("Post not Found")}</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='w-full lg:pt-20 pt-52 z-0'>
                        <div className="m-0 w-full">
                            <div className="loader">{i18n?.t("Loading")}...</div>
                        </div>
                    </main>
                </div>
            );
        }

        if (!this.props.event_id || !this.props.event_id?.startsWith("$")) {
            return (
                <div className="min-h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | {i18n?.t("Post not Found")}</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">{i18n?.t("The Post you wanted does not exist!")}</h1>
                    </main>
                    <Footer></Footer>
                </div>
            );
        }

        if (image_event) {
            const post_title = image_event.content['m.caption'].filter(cap => {
                const possible_html_caption = (cap as { body: string; mimetype: string; });
                const possible_text_caption = (cap as { "m.text": string; });
                return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") || possible_text_caption["m.text"];
            }).map(cap => {
                const possible_html_caption = (cap as { body: string; mimetype: string; });
                const possible_text_caption = (cap as { "m.text": string; });
                return (possible_html_caption.body && possible_html_caption.mimetype === "text/html") ? possible_html_caption.body : possible_text_caption["m.text"];
            })[0];
            return (
                <div className="min-h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
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

                    <main className='mb-auto lg:pt-20 pt-56 z-0'>
                        {isImageGalleryEvent(image_event) ? this.renderImageGalleryEvent(image_event, post_title) : (isImageEvent(image_event) ? this.renderSingleImageEvent(image_event, post_title) : <div key={(image_event as MatrixEventBase).event_id}></div>)}
                        <div className="grow bg-[#f8f8f8] dark:bg-[#06070D] min-h-[25rem] flex flex-col items-center">
                            <div className="flex flex-col items-start lg:min-w-[60rem] lg:w-[60rem]">
                                <h1 className="my-4 text-6xl text-gray-900 dark:text-gray-200 font-bold">{post_title}</h1>
                                <h3 className="cursor-pointer mt-0 mb-4 text-xl text-gray-900 dark:text-gray-200 font-normal inline-flex">
                                    {avatar_url ? <span className="block object-cover rounded-full mr-4"> <img className="object-cover rounded-full" src={this.context.client.downloadLink(avatar_url)!} height="24" width="24" alt={displayname} title={displayname} /> </span> : undefined}
                                    <Link href={"/profile/" + encodeURIComponent(image_event.sender)} passHref><span className='hover:text-teal-400'>{displayname}</span></Link>
                                </h3>
                                {isImageEvent(image_event) ? (image_event.content['matrixart.license'] ? <h3 className='cursor-pointer mt-0 mb-4 text-l text-gray-600 dark:text-gray-400 font-normal'>{i18n?.t("License:")} <a href={this.getLicenseUrl(image_event.content['matrixart.license'])} title={this.getLicenseName(image_event.content['matrixart.license'])}>{this.getLicenseName(image_event.content['matrixart.license'])}</a></h3> : undefined) : undefined}
                                {isImageGalleryEvent(image_event) ? this.renderImageGalleryTags(image_event) : (isImageEvent(image_event) ? this.renderSingleImageTags(image_event) : <div key={(image_event as MatrixEventBase).event_id + "tags"}></div>)}
                            </div>
                        </div>
                    </main>
                    <Footer></Footer>
                </div>
            );
        } else {
            return (
                <div className="min-h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | {i18n?.t("Post not Found")}</title>
                        <meta property="og:title" content="Matrix Art | Post not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | Post not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">{i18n?.t("The Post you wanted does not exist!")}</h1>
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
        const thumbnail_url = this.context.client.thumbnailLink(imageEvent.content['m.file'].url, "scale", imageEvent.content['m.image'].width - 1, imageEvent.content['m.image'].height - 1);

        if (!url || !thumbnail_url) {
            return <></>;
        }

        const metadata = {
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            contentUrl: url,
            encodingFormat: imageEvent.content['m.file'].mimetype,
            // TODO get this from the event itself
            license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
            author: this.state.displayname,
            name: imageEvent.content['m.text'],
            "width": imageEvent.content['m.image'].width,
            "height": imageEvent.content['m.image'].height
        };
        if (imageEvent.content['m.thumbnail']) {
            if (imageEvent.content['m.thumbnail'].length > 0) {
                //@ts-ignore TS is not able to figure out types here
                metadata["thumbnail"] = {
                    "@context": "https://schema.org/",
                    "@type": "ImageObject",
                    "contentUrl": this.context.client?.downloadLink(imageEvent.content['m.thumbnail'][0].url)!,
                    "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                    "author": imageEvent.content.displayname,
                    "name": imageEvent.content['m.text'],
                };
            }
        }
        const blurhash = imageEvent.content['xyz.amorgan.blurhash'];
        const image_html = blurhash ? (
            <div className="flex">
                <Blurhash
                    className="max-w-full lg:max-w-3xl max-h-[54.25rem]"
                    hash={blurhash}
                    width="100%"
                    height=""
                />
                <img loading="eager" width={imageEvent.content['m.image'].width - 1} height={imageEvent.content['m.image'].height - 1} alt={caption} title={caption} className="h-auto w-full relative -ml-[100%] object-cover align-bottom max-h-[54.25rem]" src={thumbnail_url} />
            </div>
        ) : (
            <img loading="eager" width={imageEvent.content['m.image'].width - 1} height={imageEvent.content['m.image'].height - 1} className="h-auto w-full max-h-[54.25rem]" alt={caption} title={caption} src={thumbnail_url} />
        );
        return (
            <>
                <Head>
                    <meta property="og:image" content={url} key="og-image" />
                    <meta property="og:image:type" content={imageEvent.content["m.file"].mimetype} key="og-image-type" />
                    <meta property="og:image:alt" content={caption} key="og-image-alt" />
                    <meta property="og:image:width" content={imageEvent.content["m.image"].width.toString()} key="og-image-width" />
                    <meta property="og:image:height" content={imageEvent.content["m.image"].height.toString()} key="og-image-height" />
                    <meta name="twitter:image" content={url} key="og-twitter-image" />
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata) }} />
                </Head>
                <div className="flex justify-center p-10 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <LightGallery
                        plugins={[lgThumbnail, lgZoom]}
                        elementClassNames="shadow-2xl max-w-full lg:max-w-3xl max-h-[54.25rem] shadow-black cursor-zoom-in"
                        key={imageEvent.event_id}
                        thumbnail={true}
                    >
                        <a href={url} title={caption} data-src={url}>
                            {image_html}
                        </a>
                    </LightGallery>
                </div>
            </>
        );
    }

    renderImageGalleryEvent(imageEvent: ImageGalleryEvent, caption: string) {
        const metadata: { "@context": string; "@type": string; contentUrl: string; license: string; author: string; name: string; thumbnail: any; encodingFormat: string; width: number; height: number; }[] = [];
        const images = imageEvent.content['m.image_gallery'].map(image => {
            const url = this.context.client?.downloadLink(image["m.file"].url);
            const thumbnail_url = this.context.client?.downloadLink(image['m.thumbnail'] ? (image['m.thumbnail'].length > 0 ? image['m.thumbnail'][0].url : image["m.file"].url) : image["m.file"].url);
            if (!url || !thumbnail_url) {
                return <></>;
            }
            metadata.push({
                "@context": "https://schema.org/",
                "@type": "ImageObject",
                contentUrl: url,
                "thumbnail": image['m.thumbnail'] ? (image['m.thumbnail'].length > 0 ? {
                    "@context": "https://schema.org/",
                    "@type": "ImageObject",
                    "contentUrl": this.context.client?.downloadLink(image['m.thumbnail'][0].url)!,
                    "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                    "author": imageEvent.content.displayname,
                    "name": image['m.text']
                } : undefined) : undefined,
                encodingFormat: image['m.file'].mimetype,
                // TODO get this from the event itself
                license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                author: this.state.displayname!,
                name: image['m.text'],
                "width": image['m.image'].width,
                "height": image['m.image'].height
            });
            const blurhash = image["xyz.amorgan.blurhash"];
            const image_html = blurhash ? (
                <div className="flex">
                    <Blurhash
                        className="max-w-full lg:max-w-3xl max-h-[54.25rem]"
                        hash={blurhash}
                        width="100%"
                        height=""
                    />
                    <img loading="eager" width={image['m.image'].width} height={image['m.image'].height} alt={caption} title={caption} className="h-auto w-full relative -ml-[100%] object-cover align-bottom" src={thumbnail_url} />
                </div>
            ) : (
                <img loading="eager" width={image['m.image'].width} height={image['m.image'].height} className="h-auto w-full" alt={caption} title={caption} src={thumbnail_url} />
            );
            return (
                <a key={url} href={url} title={caption} data-src={url}>
                    {image_html}
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
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata) }} />
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

export const getServerSideProps: GetServerSideProps = async ({ res, locale, query }) => {
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
                            ...(await serverSideTranslations(locale || 'en', ['common'])),
                            directory_data: JSON.stringify(data),
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
                let roomId;
                try {
                    roomId = await client?.followUser(user.public_user_room);
                } catch {
                    console.error("Unbable to join room");
                    continue;
                }
                const events = await client?.getTimeline(roomId, 100);
                // Filter events by type
                const image_event = events.find((event) => ((event.type == "m.image_gallery" || event.type == "m.image") && !event.unsigned?.redacted_because) && event.event_id === event_id);
                if (image_event == undefined) {
                    continue;
                }
                try {
                    const profile = await client.getProfile(image_event.sender);
                    return {
                        props: {
                            ...(await serverSideTranslations(locale || 'en', ['common'])),
                            image_event: image_event as MatrixImageEvents,
                            event_id: event_id,
                            hasFullyLoaded: true,
                            displayname: profile.displayname,
                            avatar_url: profile.avatar_url || null // eslint-disable-line unicorn/no-null
                        }
                    };
                } catch (error) {
                    console.debug(`Failed to fetch profile for user ${image_event.sender}:`, error);
                    return {
                        props: {
                            ...(await serverSideTranslations(locale || 'en', ['common'])),
                            image_event: image_event as MatrixImageEvents,
                            event_id: event_id,
                            hasFullyLoaded: true,
                            displayname: image_event.sender
                        }
                    };
                }
            }
        } catch {
            return {
                notFound: true, props: {
                    ...(await serverSideTranslations(locale || 'en', ['common'])),
                }
            };
        }
    }
    return {
        notFound: true, props: {
            ...(await serverSideTranslations(locale || 'en', ['common'])),
        }
    };

};
export default withRouter(Post);
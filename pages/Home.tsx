import React, { Component } from 'react';
import { RingLoader } from 'react-spinners';
import { ImageEvent, ImageGalleryEvent, MatrixEvent, MatrixEventBase } from '../helpers/event_types';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/Header';
import { ClientContext } from '../components/ClientContext';
import { constMatrixArtServer } from '../helpers/matrix_client';

type ImageEvents = ImageEvent | ImageGalleryEvent;

type Props = {
};

type State = {
    directory_data: { _id: string; user_id: string; user_room: string; }[];
    error?: any;
    directoryIsLoaded: boolean;
    isLoadingImages: boolean;
    hasFullyLoaded: boolean;
    // TODO make sure we parse both extev variants properly
    image_events: ImageEvents[] | [];
};

const centerSpinner = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

export default class Home extends Component<Props, State>{
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoadingImages: false,
            directoryIsLoaded: false,
            hasFullyLoaded: false,
            image_events: []
        } as State;
    }

    async componentDidUpdate() {
        await this.loadEvents();
    }

    async componentDidMount() {
        // auto-register as a guest if not logged in
        if (!this.context.client?.accessToken) {
            this.registerAsGuest();
        } else {
            console.log("Already logged in");
            try {
                const data = await (await fetch('/api/directory')).json();
                this.setState({ directory_data: data.data, directoryIsLoaded: true });
            } catch (error) {
                this.setState({
                    hasFullyLoaded: true,
                    error
                });
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
        } catch (err) {
            console.error("Failed to register as guest:", err);
            this.setState({
                error: "Failed to register as guest: " + JSON.stringify(err),
            });
        }
    }

    async loadEvents() {
        const { directoryIsLoaded, directory_data, isLoadingImages, hasFullyLoaded } = this.state;
        if (!directoryIsLoaded || isLoadingImages || hasFullyLoaded) {
            return;
        }
        this.setState({
            isLoadingImages: true,
        });
        try {
            for (let user of directory_data) {
                // We dont need many events
                const roomId = await this.context.client?.followUser(user.user_room);
                await this.context.client?.getTimeline(roomId, 100, (events) => {
                    // Filter events by type
                    const image_events = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image");
                    console.log("Adding ", image_events.length, " items");
                    this.setState({
                        image_events: image_events,
                    });
                });
            }
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
            });
        } finally {
            this.setState({
                hasFullyLoaded: true,
                isLoadingImages: false
            });
        }
    }

    render() {
        const { error, hasFullyLoaded, image_events } = this.state;

        if (error) {
            return (
                <div>Error: {error.message}</div>
            );
        } else if (!hasFullyLoaded) {
            return (
                <div className="flex h-screen">
                    <div className="m-auto">
                        <RingLoader css={centerSpinner} size={150} color={"#123abc"} loading={!hasFullyLoaded} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className='h-full bg-[#f8f8f8] dark:bg-[#06070D]'>
                    <Head>
                        <title key="title">Matrix Art | Home</title>
                        <meta property="og:title" content="Matrix Art | Home" key="og-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='lg:pt-[108px] pt-[216px] z-0'>
                        <div className='z-[100] sticky lg:top-[108px] top-[216px] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                            <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                                <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Home</h1>
                            </div>
                        </div>
                        <div className='m-10'>
                            <ul className='flex flex-wrap gap-1'>
                                {image_events.map(event => isImageGalleryEvent(event) ? this.render_gallery(event) : isImageEvent(event) ? this.render_image(event) : <div key={(event as MatrixEventBase).event_id}></div>)}
                                <li className='grow-[10]'></li>
                            </ul>
                        </div>

                    </main>
                    <footer></footer>
                </div>
            );
        };
    }



    render_gallery(event: ImageGalleryEvent) {
        const caption = event.content['m.caption'].filter((cap) => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            return possible_html_caption.body !== undefined && possible_html_caption.mimetype === "text/html";
        });
        let caption_text = "";
        if (caption.length != 0) {
            caption_text = (caption[0] as { body: string; mimetype: string; }).body;
        }
        return event.content['m.image_gallery'].map(image => {
            return this.render_image_box(image['m.thumbnail'][0].url, event.event_id + image['m.file'].url, event.event_id, event.sender, caption_text);
        });
    }


    render_image(event: ImageEvent) {
        const caption = event.content['m.caption'].filter((cap) => {
            const possible_html_caption = (cap as { body: string; mimetype: string; });
            return possible_html_caption.body !== undefined && possible_html_caption.mimetype === "text/html";
        });
        let caption_text = "";
        if (caption.length != 0) {
            caption_text = (caption[0] as { body: string; mimetype: string; }).body;
        }
        return this.render_image_box(event.content['m.thumbnail'][0].url, event.event_id, event.event_id, event.sender, caption_text);
    }

    render_image_box(thumbnail_url: string, id: string, post_id: string, sender: string, caption: string) {
        // TODO show creators display name instead of mxid and show avatar image
        const direct_link = `/post/${encodeURIComponent(post_id)}`;
        return (
            <li className='h-[270px]' key={id}>
                <Link href={direct_link}>
                    <div className='relative h-[270px] cursor-pointer'>
                        <img className='relative max-w-full h-[270px] object-cover align-bottom z-0' src={this.context.client?.thumbnailLink(thumbnail_url, "scale", 270, 270)}></img>
                        <div className="flex-col max-w-full h-[270px] opacity-0 hover:opacity-100 duration-300 absolute bg-gradient-to-b from-transparent to-black/[.25] inset-0 z-10 flex justify-end items-start text-white p-4">
                            <h2 className='truncate max-w-full text-base font-semibold'>{caption}</h2>
                            <p className='truncate max-w-full text-sm'>{sender}</p>
                        </div>
                    </div>
                </Link>
            </li>
        );
    }

}
Home.contextType = ClientContext;

// TODO also render the edits properly later on
export function isImageGalleryEvent(event: ImageEvents): event is ImageGalleryEvent {
    return event.type === "m.image_gallery" && event.redacted_because === undefined;
}


export function isImageEvent(event: ImageEvents): event is ImageEvent {
    return event.type === "m.image" && event.redacted_because === undefined;
};
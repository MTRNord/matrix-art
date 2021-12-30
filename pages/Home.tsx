import React, { Component } from 'react';
import Client from "../helpers/matrix_client";
import { RingLoader } from 'react-spinners';
import { ImageEvent, ImageGalleryEvent } from '../helpers/event_types';
import Link from 'next/link';

type ImageEvents = ImageEvent | ImageGalleryEvent;

type Props = {
    client: Client | undefined;
};

type State = {
    directory_data: { _id: string; user_id: string; user_room: string; }[];
    viewingUserId?: string;
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

const constMatrixArtServer = process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL;

export default class Home extends Component<Props, State>{
    constructor(props: Props) {
        super(props);

        this.state = {
            viewingUserId: this.props.client?.userId,
            isLoadingImages: false,
            directoryIsLoaded: false,
            hasFullyLoaded: false,
            image_events: []
        } as State;
    }

    async componentDidUpdate() {
        await this.loadEvents();
    }

    componentDidMount() {
        // auto-register as a guest if not logged in
        if (typeof window !== "undefined") {
            // Client-side-only code
            if (!this.props.client?.accessToken) {
                this.registerAsGuest();
            } else {
                console.log("Already logged in");
                fetch('/api/directory')
                    .then((res) => res.json())
                    .then(
                        (data) => this.setState({ ...this.state, directory_data: data.data, directoryIsLoaded: true }),
                        // Note: it's important to handle errors here
                        // instead of a catch() block so that we don't swallow
                        // exceptions from actual bugs in components.
                        (error) => {
                            this.setState({
                                ...this.state,
                                hasFullyLoaded: true,
                                error
                            });
                        }
                    );
            }
        }

    }

    async registerAsGuest() {
        try {
            let serverUrl = constMatrixArtServer + "/_matrix/client";
            await this.props.client?.registerAsGuest(serverUrl);
            window.location.reload();
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
            ...this.state,
            isLoadingImages: true,
        });
        try {
            for (let user of directory_data) {
                // We dont need many events
                const roomId = await this.props.client?.followUser(user.user_room);
                await this.props.client?.getTimeline(roomId, 100, (events) => {
                    // Filter events by type
                    const image_events = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image");
                    console.log("Adding ", image_events.length, " items");
                    this.setState({
                        ...this.state,
                        image_events: [...this.state.image_events, ...image_events],
                    });
                });
            }
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
            });
        } finally {
            this.setState({
                ...this.state,
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
                <>
                    <header className='flex fixed top-0 left-0 right-0 bottom-0 h-[54px] z-2 items-center'>
                        <span className='flex items-center h-full mx-10 text-gray-900 dark:text-gray-200 font-bold'><Link href="/">Matrix Art</Link></span>
                        <div className='flex flex-1 items-center'>
                            <div className='flex flex-grow-1 h-full relative items-center'>
                                <form className='w-[200px] text-gray-900 dark:text-gray-200'>
                                    <div className='duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400'>
                                        <input className='bg-transparent w-min-[20px] focus:outline-none' type="text" placeholder='Search & Discover' />
                                    </div>
                                </form>
                            </div>

                            <nav className='flex-shrink-0 relative mr-0 flex h-full'>
                                <span className='px-4 h-auto w-min-[24px] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/register">Join</Link></span>
                                <span className='px-4 h-auto w-min-[24px] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/login">Log in</Link></span>
                            </nav>
                        </div>
                        <span className='inline-block bg-gray-900 dark:bg-gray-200 w-[1px] h-[27px]'></span>
                        <div className='h-full relative'>
                            <div className='flex'>
                                <button className='text-teal-400 bg-transparent relative h-[54px] min-w-[150px] z-2 cursor-auto font-semibold'>Submit</button>
                            </div>
                        </div>
                    </header>
                    <main className='pt-[54px] z-0'>
                        <div className='z-1 sticky top-[54px] bg-[#fefefe] dark:bg-[#14181E]'>
                            <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                                <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Home</h1>
                            </div>
                        </div>
                        <div className='m-10'>
                            <ul className='flex flex-wrap gap-1'>
                                {image_events.map(event => isImageGalleryEvent(event) ? this.render_gallery(event) : this.render_image(event))}
                                <li className='flex-grow-10'></li>
                            </ul>
                        </div>

                    </main>
                    <footer></footer>
                </>
            );
        };
    }



    render_gallery(event: ImageGalleryEvent) {
        return event.content['m.image_gallery'].map(image =>
        (
            <li className='flex-grow-1 h-[270px]' key={event.event_id + image['m.file'].url}>
                <img className='object-cover align-bottom max-w-full max-h-full' src={this.props.client?.thumbnailLink(image['m.thumbnail'][0].url, "scale", 270, 270)}></img>
            </li>
        )
        );
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
        // TODO append creators display name and make avatar show up
        return (
            <li className='flex-grow-1 h-[270px]' key={event.event_id}>
                <div className='relative'>
                    <img className='relative max-w-full max-h-full object-cover align-bottom z-0' src={this.props.client?.thumbnailLink(event.content['m.thumbnail'][0].url, "scale", 270, 270)}></img>
                    <p className="max-w-full max-h-full opacity-0 hover:opacity-100 duration-300 absolute bg-gradient-to-b from-transparent to-black/[.25] inset-0 z-10 flex justify-start items-end text-base text-white font-semibold p-4">{caption_text}</p>
                </div>
            </li>
        );
    }

}

function isImageGalleryEvent(event: ImageEvents): event is ImageGalleryEvent {
    return event.type === "m.image_gallery";
}

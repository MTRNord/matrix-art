import React, { Component } from 'react';
import { RingLoader } from 'react-spinners';
import { MatrixEventBase, MatrixImageEvents } from '../helpers/event_types';
import Head from 'next/head';
import Header from '../components/Header';
import { ClientContext } from '../components/ClientContext';
import { constMatrixArtServer } from '../helpers/matrix_client';
import FrontPageImage from '../components/FrontPageImage';
import Footer from '../components/Footer';

type Props = {
};

type State = {
    directory_data: { _id: string; user_id: string; user_room: string; }[];
    error?: any;
    directoryIsLoaded: boolean;
    isLoadingImages: boolean;
    hasFullyLoaded: boolean;
    // TODO make sure we parse both extev variants properly
    image_events: MatrixImageEvents[] | [];
};

export const centerSpinner = `
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
            await this.context.guest_client?.registerAsGuest(serverUrl);
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
        const client = this.context.client.isGuest ? this.context.client : this.context.guest_client;
        this.setState({
            isLoadingImages: true,
        });
        try {
            for (let user of directory_data) {
                // We dont need many events
                const roomId = await client?.followUser(user.user_room);
                await client?.getTimeline(roomId, 100, (events) => {
                    // Filter events by type
                    const image_events = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[];
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
                    <main className='h-full lg:pt-[108px] pt-[216px] z-0'>
                        <div className='z-[100] sticky lg:top-[108px] top-[216px] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                            <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                                <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Home</h1>
                            </div>
                        </div>
                        <div className='m-10'>
                            <ul className='flex flex-wrap gap-1'>
                                {image_events.map(event => <FrontPageImage event={event} key={(event as MatrixEventBase).event_id} />)}
                                <li className='grow-[10]'></li>
                            </ul>
                        </div>

                    </main>
                    <Footer></Footer>
                </div>
            );
        };
    }

}
Home.contextType = ClientContext;
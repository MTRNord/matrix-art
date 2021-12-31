import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component, ReactNode } from "react";
import { RingLoader } from "react-spinners";
import { ClientContext } from "../../components/ClientContext";
import Header from "../../components/Header";
import { MatrixImageEvents } from "../../helpers/event_types";
import Client, { constMatrixArtServer } from "../../helpers/matrix_client";

const centerSpinner = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

interface Props {
    client: Client | undefined;
    router: NextRouter;
}

type State = {
    directory_data: { _id: string; user_id: string; user_room: string; }[];
    event_id?: string;
    hasFullyLoaded: boolean;
    isLoadingImages: boolean;
    directoryIsLoaded: boolean;
    image_event: MatrixImageEvents;
    error?: any;
};

class Post extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            hasFullyLoaded: false,
            directoryIsLoaded: false,
            isLoadingImages: false
        } as State;
    }

    async componentDidUpdate() {
        if (this.state.event_id && this.state.event_id.startsWith("$")) {
            await this.loadEvent(this.state.event_id);
        }
    }

    async handleRouteChangeComplete(url: string, { shallow }: any) {
        const { id } = this.props.router.query;
        console.log(`id: ${id}`);
        console.log(`is ready: ${this.props.router.isReady}`);
        const event_id = decodeURIComponent(id as string);

        if (event_id && event_id.startsWith("$")) {
            // auto-register as a guest if not logged in
            if (!this.context.client?.accessToken) {
                // Client-side-only code
                if (typeof window !== "undefined") {
                    this.registerAsGuest();
                }
            } else {
                console.log("Already logged in");
                try {
                    const data = await (await fetch('/api/directory')).json();
                    this.setState({ event_id: event_id, directory_data: data.data, directoryIsLoaded: true });
                } catch (error) {
                    this.setState({
                        hasFullyLoaded: true,
                        error
                    });
                }
            }
        }
    }

    componentDidMount() {
        // Hack due to SSR
        this.props.router.events.on("routeChangeComplete", this.handleRouteChangeComplete.bind(this));
    }

    componentWillUnmount() {
        this.props.router.events.off("routeChangeComplete", this.handleRouteChangeComplete.bind(this));
    }

    async registerAsGuest() {
        try {
            let serverUrl = constMatrixArtServer + "/_matrix/client";
            await this.context.client?.registerAsGuest(serverUrl);
            window.location.reload();
        } catch (err) {
            console.error("Failed to register as guest:", err);
            this.setState({
                error: "Failed to register as guest: " + JSON.stringify(err),
            });
        }
    }

    async loadEvent(event_id: string) {
        const { directoryIsLoaded, directory_data, hasFullyLoaded, isLoadingImages } = this.state;
        if (!directoryIsLoaded || isLoadingImages || hasFullyLoaded) {
            return;
        }
        this.setState({
            isLoadingImages: true,
        });
        try {
            // TODO fix this. It is super inefficent.
            for (let user of directory_data) {
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
        const { error, event_id, hasFullyLoaded } = this.state;

        if (!hasFullyLoaded) {
            return (
                <div className="flex h-screen">
                    <div className="m-auto">
                        <RingLoader css={centerSpinner} size={150} color={"#123abc"} loading={!hasFullyLoaded} />
                    </div>
                </div>
            );
        }

        if (!event_id || !event_id?.startsWith("$")) {
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | Post not Found</title>
                    </Head>
                    <Header></Header>
                    <main className='h-full lg:pt-[108px] pt-[216px] z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The Post you wanted does not exist!</h1>
                    </main>
                </div>
            );
        }

        if (hasFullyLoaded) {
            const post_title = "";
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | {post_title}</title>
                    </Head>
                    <Header></Header>

                    <main className='lg:pt-[108px] pt-[216px] z-0'>

                    </main>
                </div>
            );
        } else if (error) {
            return (
                <div>Error: {error.message}</div>
            );
        } else {
            return <></>;
        }

    }
}

Post.contextType = ClientContext;
export default withRouter(Post);
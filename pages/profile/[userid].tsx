import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component } from "react";
import { ClientContext } from "../../components/ClientContext";
import Header from "../../components/Header";
import { BannerEvent, MatrixEvent } from "../../helpers/event_types";
import { constMatrixArtServer } from "../../helpers/matrix_client";

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
};

type State = {
    displayname: string;
    avatar_url: string;
    events: MatrixEvent[] | [];
    error?: any;
    isLoadingImages: boolean;
    hasFullyLoaded: boolean;
};

class Profile extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);

        this.state = {
            displayname: this.props.mxid,
            events: []
        } as State;
    }

    async componentDidMount() {
        // auto-register as a guest if not logged in
        if (!this.context.client?.accessToken) {
            this.registerAsGuest();
        } else {
            console.log("Already logged in");
            if (!this.props.mxid) {
                return;
            }
            try {
                const profile = await this.context.client.getProfile(this.props.mxid);
                this.setState({
                    displayname: profile.displayname,
                    avatar_url: profile.avatar_url,
                });
            } catch (ex) {
                console.debug(`Failed to fetch profile for user ${this.props.mxid}:`, ex);
            }
            await this.loadEvents();
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
        const { isLoadingImages, hasFullyLoaded } = this.state;
        if (isLoadingImages || hasFullyLoaded) {
            return;
        }
        const client = this.context.client.isGuest ? this.context.client : this.context.guest_client;
        this.setState({
            isLoadingImages: true,
        });
        try {
            const roomId = await client?.followUser("#" + this.props.mxid);
            await client?.getTimeline(roomId, 100, (events) => {
                const filtered_events = events.filter(event => event.type !== "m.room.member" && event.type !== "m.room.topic" && event.type !== "m.room.name" && event.type !== "m.room.power_levels");
                console.log("Adding ", filtered_events.length, " items");
                this.setState({
                    events: filtered_events,
                });
            });
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

    renderNotFound() {
        return (
            <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                <Head>
                    <title key="title">Matrix Art | User not Found</title>
                    <meta property="og:title" content="Matrix Art | User not Found" key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content="Matrix Art | User not Found" key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='h-full lg:pt-[108px] pt-[216px] z-0 flex items-center justify-center'>
                    <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The User you wanted does not exist!</h1>
                </main>
            </div>
        );
    }

    render() {
        if (!this.props.mxid || !this.props.mxid?.startsWith("@")) {
            return this.renderNotFound();
        }

        const banner_event = this.state.events.filter(event => event.type === "matrixart.profile_banner")[0];
        const avatar_url = this.state.avatar_url;
        return (
            <div className="h-full bg-[#f8f8f8] dark:bg-[#06070D]">
                <Head>
                    <title key="title">Matrix Art | {this.state.displayname}</title>
                    <meta property="og:title" content={`Matrix Art | ${this.state.displayname}`} key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content={`Matrix Art | ${this.state.displayname}`} key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='lg:pt-[108px] pt-[216px] z-0'>
                    {banner_event ? <div style={{
                        backgroundImage: `url(${this.context.client.downloadLink((banner_event as BannerEvent).content["m.file"].url)})`
                    }}
                        className="fixed top-[54px] w-full h-[520px] bg-cover bg-[position:50%]"
                    ></div> : null}
                    <div className="relative">
                        <div className="relative mb-0 min-h-[700px]">
                            <div id="transparent_gradient" className="absolute left-0 right-0 top-[626px] bottom-0"></div>
                            <div className="px-[60px] relative pt-[250px]">
                                <div className="relative mt-0">
                                    <div className="relative inline-flex z-[1] mb-[40px]">
                                        <span>
                                            <div className="block relative">
                                                {/* TODO fallback*/}
                                                <img className="block object-cover rounded-[4px]" src={avatar_url} alt={this.state.displayname} title={this.state.displayname} />
                                            </div>
                                        </span>
                                        <div className="ml-[20px] flex flex-col justify-center">
                                            <h1 className="text-bold text-5xl text-gray-900 dark:text-gray-200 mt-[-17px] flex items-[flex-end]">{this.state.displayname}</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

}
Profile.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query, res } = context;
    const mxid = decodeURIComponent(query.userid as string);

    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    if (mxid && mxid.startsWith("@")) {
        try {
            return {
                props: {
                    mxid: mxid
                }
            };
        } catch (error) {
            return { notFound: true, props: {} };
        }
    }
    return { notFound: true, props: {} };

};

export default withRouter(Profile);;
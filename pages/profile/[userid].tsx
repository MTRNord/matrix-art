import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { Component } from "react";
import { ClientContext } from "../../components/ClientContext";
import Footer from "../../components/Footer";
import FrontPageImage from "../../components/FrontPageImage";
import Header from "../../components/Header";
import { BannerEvent, MatrixEvent, MatrixEventBase, MatrixImageEvents } from "../../helpers/event_types";
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
        const image_events = this.state.events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[];
        // TODO opengraph shows mxid instead of displayname
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
                <main className='lg:pt-[108px] pt-[216px] z-0 bg-[#f8f8f8] dark:bg-[#06070D]'>
                    {banner_event ? <div style={{
                        backgroundImage: `url(${this.context.client.downloadLink((banner_event as BannerEvent).content["m.file"].url)})`
                    }}
                        className="fixed top-[54px] w-full h-[520px] bg-cover bg-[position:50%]"
                    ></div> : null}
                    <div className="relative">
                        <div className="relative mb-0 min-h-[700px]">
                            <div id="transparent_gradient" className="absolute left-0 right-0 top-[626px] bottom-0 bg-[#f8f8f8] dark:bg-[#06070D]"></div>
                            <div className="px-[60px] relative pt-[250px] pb-96 ">
                                <div className="relative mt-0">
                                    <div className="relative inline-flex z-[1] mb-[40px]">
                                        <span>
                                            <div className="block relative">
                                                {/* TODO fallback*/}
                                                <img className="block object-cover rounded-[4px]" src={this.context.client.downloadLink(avatar_url)!} height="100" width="100" alt={this.state.displayname} title={this.state.displayname} />
                                            </div>
                                        </span>
                                        <div className="ml-[20px] flex flex-col justify-center">
                                            <h1 className="font-extrabold text-5xl text-gray-900 dark:text-gray-200 mt-[-17px] flex items-end">{this.state.displayname}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[52px] relative w-full">
                                    <div className="min-h-0">
                                        <nav className="w-full h-[52px] box-border flex items-center bg-[#f8f8f8] dark:bg-[#06070D]">
                                            <span id="magic-spacer"></span>
                                            <div className="flex items-center w-full h-full overflow-hidden whitespace-nowrap box-border min-w-fit">
                                                <Link href={`/profile/${encodeURIComponent(this.props.mxid)}`} passHref><a className={`text-base font-bold text-gray-900 dark:text-gray-200 capitalize ml-[8px] px-[32px] relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>Home</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(this.props.mxid)}/gallery`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-[32px] relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>Gallery</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(this.props.mxid)}/about`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-[32px] relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>About</a></Link>
                                            </div>
                                            <div className="pr-[15px]">
                                                {/*TODO Share menu here*/}
                                            </div>
                                            <div>
                                                <button id="reflection" className="min-w-[126px] h-[52px] min-h-[40px] box-border m-0 shadow-none rounded-none relative overflow-hidden z-0 border-none outline-none px-[20px] flex items-center justify-center cursor-pointer bg-teal-400 text-gray-900 text-sm font-bold">Follow</button>
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                                <div className="w-full bg-transparent">
                                    <div className="pt-[20px]">
                                        <div className="flex">
                                            <div className="mr-[60px] overflow-hidden pb-4 flex-[auto]">
                                                <div>
                                                    <section className="pb-[15px] block">
                                                        <div className="w-full flex items-center mt-[30px] mb-[15px]">
                                                            <h2 className="font-bold text-lg tracking-[.3px] leading-[1.22] text-gray-900 dark:text-gray-200">Gallery</h2>
                                                            <div className="ml-4 flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(this.props.mxid)}/gallery`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-[22px] uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>See All</a></Link>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <ul className='flex flex-wrap gap-1'>{image_events.map(event => <FrontPageImage event={event} imageHeight="286px" key={(event as MatrixEventBase).event_id} />)}
                                                                <li className='grow-[10]'></li>
                                                            </ul>
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>
                                            <div className="w-[600px] flex-none">
                                                <div>
                                                    <section className="pb-[15px] block">
                                                        <div className="w-full flex items-center mt-[30px] mb-[15px]">
                                                            <h2 className="font-bold text-gray-900 dark:text-gray-200 text-lg tracking--[.3px] leading-[1.22] max-w-[90%] mr-auto overflow-hidden text-ellipsis whitespace-nowrap">{`About ${this.state.displayname} (Currently Hardcoded)`}</h2>
                                                            <div className="ml-[16px] flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(this.props.mxid)}/about`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-[22px] uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>More</a></Link>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95] pt-[27px] w-ull flex flex-col box-border tracking--[.3px] text-gray-900 dark:text-gray-200">
                                                            <div className="px-[32px]">
                                                                <div className="mb-[32px] font-regular text-base leading-[1.22] whitespace-pre-wrap">
                                                                    Coder // Photographer // Student
                                                                </div>
                                                            </div>
                                                            <div className="px-[32px]">
                                                                <div className="mb-[32px] flex items-start justify-between flex-wrap w-full">
                                                                    <div className="h-[44px] mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">Pronouns</div>
                                                                    <div className="w-full justify-items-end">They/Them</div>
                                                                </div>
                                                            </div>
                                                            <div className="px-[32px]">
                                                                <div className="mb-[32px] flex items-start justify-between flex-wrap w-full">
                                                                    <div className="h-[44px] mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">Follow me on</div>
                                                                    <div className="w-full max-w-[344px] grid gap-4 auto-cols-[44px] auto-rows-[44px] grid-flow-col justify-items-end">{/*TODO Social Icons */}</div>
                                                                </div>
                                                            </div>
                                                            <div className="px-[32px]">
                                                                <div className="mb-[32px] font-regular text-base leading-[1.22] whitespace-pre-wrap">
                                                                    <div className="h-[44px] mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">My Bio</div>
                                                                    <div className="text-base font-regular">Hi! I am MTRNord :) I like to photograph since quite a while. A lot of different things like Flowers or architecture but also nature.<br /><br />I also very much like doing things in 3D in blender that I may share here :)</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer></Footer>
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
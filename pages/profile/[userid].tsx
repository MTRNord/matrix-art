import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { PureComponent } from "react";
import { ClientContext } from "../../components/ClientContext";
import Footer from "../../components/Footer";
import FrontPageImage from "../../components/FrontPageImage";
import Header from "../../components/Header";
import { BannerEvent, MatrixArtProfile, MatrixEvent, MatrixEventBase, MatrixImageEvents } from "../../helpers/event_types";
import { constMatrixArtServer } from "../../helpers/matrix_client";

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
};

type State = {
    displayname: string;
    avatar_url: string;
    events: MatrixEvent[] | [];
    profile_event?: MatrixArtProfile;
    error?: any;
    isLoadingImages: boolean;
    hasFullyLoaded: boolean;
};

class Profile extends PureComponent<Props, State> {
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
            } catch (error) {
                console.debug(`Failed to fetch profile for user ${this.props.mxid}:`, error);
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
        } catch (error) {
            console.error("Failed to register as guest:", error);
            this.setState({
                error: "Failed to register as guest: " + JSON.stringify(error),
            });
        }
    }

    // TODO do this on server side
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
            const events = await client?.getTimeline(roomId, 100, { limit: 30, types: ["m.image", "m.image_gallery", "matrixart.profile", "matrixart.profile_banner"] });
            const profile_event = events.find((event) => event.type === "matrixart.profile" && event.sender === this.props.mxid);
            const filtered_events = events.filter(event => event.type !== "m.room.member" && event.type !== "m.room.topic" && event.type !== "m.room.name" && event.type !== "m.room.power_levels");
            console.log("Adding", filtered_events.length, "items");
            this.setState({
                events: filtered_events,
                profile_event: profile_event as MatrixArtProfile | undefined,
            });
        } catch (error) {
            this.setState({
                error: JSON.stringify(error),
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
            <div className="h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                <Head>
                    <title key="title">Matrix Art | User not Found</title>
                    <meta property="og:title" content="Matrix Art | User not Found" key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content="Matrix Art | User not Found" key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                    <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The User you wanted does not exist!</h1>
                </main>
            </div>
        );
    }

    render() {
        const { mxid } = this.props;
        const { events, profile_event, avatar_url, displayname } = this.state;
        if (!mxid || !mxid?.startsWith("@")) {
            return this.renderNotFound();
        }

        const banner_event = events.find(event => event.type === "matrixart.profile_banner");
        const image_events = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[];
        // TODO opengraph shows mxid instead of displayname
        return (
            <div className="h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]">
                <Head>
                    <title key="title">Matrix Art | {displayname}</title>
                    <meta property="og:title" content={`Matrix Art | ${displayname}`} key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content={`Matrix Art | ${displayname}`} key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='w-full mb-auto lg:pt-20 pt-56 z-0 bg-[#f8f8f8] dark:bg-[#06070D]'>
                    {/*{banner_event ? <div style={{
                        backgroundImage: `url(${this.context.client.downloadLink((banner_event as BannerEvent).content["m.file"].url)})`
                    }}
                        className="fixed top-14 w-full h-[32.5rem] bg-cover lg:bg-[position:50%]"
                    ></div> : undefined}*/}
                    {banner_event ? <div style={{
                        backgroundImage: `url(${this.context.client.thumbnailLink((banner_event as BannerEvent).content["m.file"].url, "scale", (banner_event as BannerEvent).content["m.image"].width - 1, (banner_event as BannerEvent).content["m.image"].height - 1)})`
                    }}
                        className="fixed top-14 w-full h-[32.5rem] bg-cover lg:bg-[position:50%]"
                    ></div> : undefined}
                    <div className="relative w-full">
                        <div className="relative mb-0 min-h-[43.75rem]">
                            <div id="transparent_gradient" className="absolute left-0 right-0 top-[39rem] bottom-0 bg-[#f8f8f8] dark:bg-[#06070D]"></div>
                            <div className="px-14 relative pt-[8.5rem] lg:pt-[15.5rem] pb-96 ">
                                <div className="relative mt-0">
                                    <div className="relative inline-flex z-[1] mb-10">
                                        <span>
                                            <div className="block relative">
                                                {/* TODO fallback*/}
                                                <img className="block object-cover rounded-md" src={this.context.client.downloadLink(avatar_url)!} height="100" width="100" alt={displayname} title={displayname} />
                                            </div>
                                        </span>
                                        <div className="ml-5 flex flex-col justify-center">
                                            <h1 className="font-extrabold text-3xl lg:text-5xl text-gray-200 mt-[-1rem] flex items-end">{displayname}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative w-full h-14">
                                    <div className="min-h-0">
                                        <nav className="w-full h-14 box-border flex items-center bg-[#f8f8f8] dark:bg-[#06070D] overflow-scroll lg:overflow-hidden">
                                            <span id="magic-spacer"></span>
                                            <div className="flex items-center w-full h-full overflow-hidden whitespace-nowrap box-border min-w-fit">
                                                <Link href={`/profile/${encodeURIComponent(mxid)}`} passHref><a className={`text-base font-bold text-gray-900 dark:text-gray-200 capitalize ml-2 px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>Home</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(mxid)}/gallery`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>Gallery</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(mxid)}/about`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none]`}>About</a></Link>
                                            </div>
                                            <div className="pr-4">
                                                {/*TODO Share menu here*/}
                                            </div>
                                            <div>
                                                <button id="reflection" className="min-w-[7.75rem] h-14 min-h-[2.5rem] box-border m-0 shadow-none rounded-none relative overflow-hidden z-0 border-none outline-none px-5 flex items-center justify-center cursor-pointer bg-teal-400 text-gray-900 text-sm font-bold">Follow</button>
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                                <div className="w-full bg-transparent">
                                    <div className="pt-5">
                                        <div className="flex flex-col-reverse lg:flex-row">
                                            <div className="mr-16 overflow-hidden pb-4 flex-[auto]">
                                                <div>
                                                    <section className="pb-4 block">
                                                        <div className="w-full flex items-center mt-8 mb-4">
                                                            <h2 className="font-bold text-lg tracking-[.3px] leading-[1.22] text-gray-900 dark:text-gray-200">Gallery</h2>
                                                            <div className="ml-4 flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(mxid)}/gallery`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-6 uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>See All</a></Link>
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
                                            <div className="lg:w-[37.5rem] w-full flex-none">
                                                <div>
                                                    <section className="pb-4 block">
                                                        <div className="w-full flex items-center mt-8 mb-4">
                                                            <h2 className="font-bold text-gray-900 dark:text-gray-200 text-lg tracking--[.3px] leading-[1.22] max-w-[90%] mr-auto overflow-hidden text-ellipsis whitespace-nowrap">{`About ${displayname}`}</h2>
                                                            <div className="ml-4 flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(mxid)}/about`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-6 uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>More</a></Link>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95] pt-7 w-ull flex flex-col box-border tracking--[.3px] text-gray-900 dark:text-gray-200">
                                                            {profile_event?.content["matrixart.profile.description"] ? <div className="px-8">
                                                                <div className="mb-8 font-regular text-base leading-[1.22] whitespace-pre-wrap">
                                                                    {profile_event ? profile_event.content["matrixart.profile.description"] : undefined}
                                                                </div>
                                                            </div> : undefined}
                                                            {profile_event?.content["matrixart.profile.pronouns"] ? <div className="px-8">
                                                                <div className="mb-8 flex items-start justify-between flex-wrap w-full">
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">Pronouns</div>
                                                                    <div className="w-full justify-items-end">{profile_event ? profile_event.content["matrixart.profile.pronouns"] : undefined}</div>
                                                                </div>
                                                            </div> : undefined}
                                                            {profile_event?.content["matrixart.profile.links"] ? <div className="px-8">
                                                                <div className="mb-8 flex items-start justify-between flex-wrap w-full">
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">Follow me on</div>
                                                                    <div className="w-full max-w-[21.5rem] grid gap-4 auto-cols-[2.75rem] auto-rows-[2.75rem] grid-flow-col justify-items-end">{/*TODO Social Icons */}</div>
                                                                </div>
                                                            </div> : undefined}
                                                            {profile_event?.content["matrixart.profile.biography"] ? <div className="px-8">
                                                                <div className="mb-8 font-regular text-base leading-[1.22] whitespace-pre-wrap">
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">My Bio</div>
                                                                    <div className="text-base font-regular">{profile_event ? profile_event.content["matrixart.profile.biography"] : undefined}</div>
                                                                </div>
                                                            </div> : undefined}
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
        } catch {
            return { notFound: true, props: {} };
        }
    }
    return { notFound: true, props: {} };

};

export default withRouter(Profile);;
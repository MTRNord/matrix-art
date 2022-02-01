import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { i18n } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { PureComponent } from "react";
import { toast } from "react-toastify";
import { ClientContext } from "../../components/ClientContext";
import { EditIcon } from "../../components/editIcon";
import Footer from "../../components/Footer";
import FrontPageImage from "../../components/FrontPageImage";
import Header from "../../components/Header";
import { UploadIcon } from "../../components/uploadIcon";
import { BannerEvent, MatrixArtProfile, MatrixEvent, MatrixEventBase, MatrixImageEvents } from "../../helpers/event_types";
import { constMatrixArtServer } from "../../helpers/matrix_client";

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
    mxid: string;
};

type State = {
    displayname: string;
    avatar_url: string;
    events: MatrixEvent[] | [];
    profile_event?: MatrixArtProfile;
    error?: string;
    isLoadingImages: boolean;
    hasFullyLoaded: boolean;
    isLoggedInUser: boolean;
    editingUsername: boolean;
    editingAbout: boolean;
};

class Profile extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);

        this.state = {
            displayname: this.props.mxid,
            avatar_url: "",
            events: [],
            isLoadingImages: false,
            hasFullyLoaded: false,
            isLoggedInUser: false,
            editingUsername: false,
            editingAbout: false,
        } as State;
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
        // auto-register as a guest if not logged in
        if (!this.context.client?.accessToken) {
            this.registerAsGuest();
        } else {
            if (!this.context.guest_client?.accessToken) {
                try {
                    let serverUrl = constMatrixArtServer + "/_matrix/client";
                    await this.context.guest_client?.registerAsGuest(serverUrl);
                } catch (error) {
                    console.error("Failed to register as guest:", error);
                }
            }
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
        this.setState({
            isLoggedInUser: this.props.mxid === this.context.client.userId && !this.context.client.isGuest
        });
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
            <div className="min-h-full flex flex-col justify-between bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                <Head>
                    <title key="title">Matrix Art | {i18n?.t("User not Found")}</title>
                    <meta property="og:title" content="Matrix Art | User not Found" key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content="Matrix Art | User not Found" key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='mb-auto lg:pt-20 pt-56 z-0 flex items-center justify-center'>
                    <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">{i18n?.t("The User you wanted does not exist!")}</h1>
                </main>
            </div>
        );
    }

    handleUsernameInputChange(event: { target: any; }) {
        this.setState({
            displayname: event.target.value
        });
    }

    async onClickEditUsername() {
        if (!this.state.editingUsername) {
            this.setState({
                editingUsername: true
            });
        } else {
            await this.context.client.setDisplayname(this.state.displayname);
            this.setState({
                editingUsername: false
            });
        }

    }

    async handleAvatarUpload(event: { target: { files: FileList | null; }; }) {
        const files = event.target.files;
        if (!files) {
            return;
        }
        const file = files[0];
        const mxc = await this.context.client.uploadFile(file);
        await this.context.client.setAvatarUrl(mxc);
        this.setState({
            avatar_url: mxc,
        });
    }

    render() {
        const { mxid } = this.props;
        const { events, profile_event, avatar_url, displayname, isLoggedInUser, editingUsername } = this.state;
        if (!mxid || !mxid?.startsWith("@")) {
            return this.renderNotFound();
        }

        const banner_event = events.find(event => event.type === "matrixart.profile_banner");
        const image_events = events.filter((event) => (event.type == "m.image_gallery" || event.type == "m.image") && !event.unsigned?.redacted_because) as MatrixImageEvents[];
        // TODO opengraph shows mxid instead of displayname
        return (
            <div className="min-h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]">
                <Head>
                    <title key="title">Matrix Art | {displayname}</title>
                    <meta property="og:title" content={`Matrix Art | ${displayname}`} key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content={`Matrix Art | ${displayname}`} key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='w-full mb-auto lg:pt-20 pt-56 z-0 bg-[#f8f8f8] dark:bg-[#06070D]'>
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
                                                {
                                                    isLoggedInUser ?
                                                        (
                                                            avatar_url ? (
                                                                <>
                                                                    <label htmlFor="avatar-upload" className="rounded-md flex justify-center items-center cursor-pointer grayscale-0 hover:grayscale transition-all ease-in-out duration-300" style={{ height: "100px", width: "100px" }}>
                                                                        <img className="block object-cover rounded-md" src={this.context.client.downloadLink(avatar_url)!} height="100" width="100" alt={displayname} title={displayname} />
                                                                        <div className="min-h-[48px] min-w-[48px] absolute left-[20%] rounded-full bg-slate-700/40 p-1 flex justify-center items-center"><EditIcon className="invert-0 duration-300 transition-all ease-in-out hover:invert" /></div>
                                                                    </label>
                                                                    <input className="hidden" id="avatar-upload" type="file" accept="image/*" onChange={this.handleAvatarUpload.bind(this)} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <label htmlFor="avatar-upload" className="rounded-md bg-slate-500 flex justify-center items-center cursor-pointer" style={{ height: "100px", width: "100px" }}>
                                                                        <UploadIcon />
                                                                    </label>
                                                                    <input className="hidden" id="avatar-upload" type="file" accept="image/*" onChange={this.handleAvatarUpload.bind(this)} />
                                                                </>
                                                            )
                                                        )
                                                        : (avatar_url ?
                                                            <img className="block object-cover rounded-md" src={this.context.client.downloadLink(avatar_url)!} height="100" width="100" alt={displayname} title={displayname} />
                                                            :
                                                            <div className="rounded-md bg-slate-500 flex justify-center items-center" style={{ height: "100px", width: "100px" }}></div>
                                                        )
                                                }
                                            </div>
                                        </span>
                                        <div className="ml-5 flex flex-col justify-center">
                                            <h1 className="font-extrabold text-3xl lg:text-5xl text-gray-200 mt-[-1rem] flex items-center gap-1">{editingUsername ? <input onChange={this.handleUsernameInputChange.bind(this)} className="placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" type="text" placeholder={i18n?.t("Set a displayname")} value={displayname}></input> : <span>{displayname}</span>}{isLoggedInUser ? <EditIcon className="cursor-pointer" onClick={this.onClickEditUsername.bind(this)} /> : undefined}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative w-full h-14">
                                    <div className="min-h-0">
                                        <nav className="w-full h-14 box-border flex items-center bg-[#f8f8f8] dark:bg-[#06070D] overflow-scroll lg:overflow-hidden">
                                            <span id="magic-spacer"></span>
                                            <div className="flex items-center w-full h-full overflow-hidden whitespace-nowrap box-border min-w-fit">
                                                <Link href={`/profile/${encodeURIComponent(mxid)}`} passHref><a className={`text-base font-bold text-gray-900 dark:text-gray-200 capitalize ml-2 px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none] brightness-100 hover:brightness-75 duration-200 ease-in-out transition-all`}>{i18n?.t("Home")}</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(mxid)}/gallery`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none] brightness-100 hover:brightness-75 duration-200 ease-in-out transition-all`}>{i18n?.t("Gallery")}</a></Link>
                                                <Link href={`/profile/${encodeURIComponent(mxid)}/about`} passHref><a className={`text-base font-bold text-gray-900 dark:text-[#b1b1b9] capitalize px-8 relative box-border inline-flex grow-0 shrink-[1] basis-auto items-center h-full decoration-[none] brightness-100 hover:brightness-75 duration-200 ease-in-out transition-all`}>{i18n?.t("About")}</a></Link>
                                            </div>
                                            <div className="pr-4">
                                                {/*TODO Share menu here*/}
                                            </div>
                                            <div>
                                                <button id="reflection" className="min-w-[7.75rem] h-14 min-h-[2.5rem] box-border m-0 shadow-none rounded-none relative overflow-hidden z-0 border-none outline-none px-5 flex items-center justify-center cursor-pointer bg-teal-400 text-gray-900 text-sm font-bold">{i18n?.t("Follow")}</button>
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
                                                            <h2 className="font-bold text-lg tracking-[.3px] leading-[1.22] text-gray-900 dark:text-gray-200">{i18n?.t("Gallery")}</h2>
                                                            <div className="ml-4 flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(mxid)}/gallery`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-6 uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>See All</a></Link>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <ul className='flex flex-wrap gap-1'>{image_events.map(event => <FrontPageImage show_nsfw={true} event={event} imageHeight="286px" key={(event as MatrixEventBase).event_id} />)}
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
                                                            <h2 className="font-bold text-gray-900 dark:text-gray-200 text-lg tracking--[.3px] leading-[1.22] max-w-[90%] mr-auto overflow-hidden text-ellipsis whitespace-nowrap">{i18n?.t("About {{displayname}}", { displayname: displayname })}</h2>
                                                            <div className="ml-4 flex flex-[1] items-center relative justify-end">
                                                                <Link href={`/profile/${encodeURIComponent(mxid)}/about`} passHref><a className={`font-regular text-xs tracking-[1.3px] leading-[1.22] ml-6 uppercase whitespace-nowrap text-gray-900 dark:text-gray-200 hover:opacity-100 opacity-0 transition-opacity duration-[25ms]`}>{i18n?.t("More")}</a></Link>
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
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">{i18n?.t("Pronouns")}</div>
                                                                    <div className="w-full justify-items-end">{profile_event ? profile_event.content["matrixart.profile.pronouns"] : undefined}</div>
                                                                </div>
                                                            </div> : undefined}
                                                            {profile_event?.content["matrixart.profile.links"] ? <div className="px-8">
                                                                <div className="mb-8 flex items-start justify-between flex-wrap w-full">
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">{i18n?.t("Follow me on")}</div>
                                                                    <div className="w-full max-w-[21.5rem] grid gap-4 auto-cols-[2.75rem] auto-rows-[2.75rem] grid-flow-col justify-items-end">{/*TODO Social Icons */}</div>
                                                                </div>
                                                            </div> : undefined}
                                                            {profile_event?.content["matrixart.profile.biography"] ? <div className="px-8">
                                                                <div className="mb-8 font-regular text-base leading-[1.22] whitespace-pre-wrap">
                                                                    <div className="h-11 mb-0 text-xs flex items-center uppercase text-gray-700 dark:text-gray-400">{i18n?.t("My Bio")}</div>
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
    const { query, res, locale } = context;
    const mxid = decodeURIComponent(query.userid as string);

    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    if (mxid && mxid.startsWith("@")) {
        try {
            return {
                props: {
                    ...(await serverSideTranslations(locale || 'en', ['common'])),
                    mxid: mxid
                }
            };
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

export default withRouter(Profile);;
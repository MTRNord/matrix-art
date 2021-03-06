import { GetServerSideProps } from "next";
import { i18n } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { PureComponent, ReactNode } from "react";
import { toast } from "react-toastify";
import { ClientContext } from "../components/ClientContext";
import { constMatrixArtServer } from "../helpers/matrix_client";

type Props = {
    router: NextRouter;
};
type State = {
    showServerField: boolean;
    generateProfile: boolean;
    serverUrl: string;
    mxid?: string;
    password?: string;
    loading: boolean;
    error?: string;
};

class Login extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            showServerField: false,
            generateProfile: false,
            mxid: "",
            password: "",
            serverUrl: constMatrixArtServer,
            loading: false,
            error: ""
        } as State;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.error && this.state.error !== prevState.error) {
            toast.dismiss();
            toast(() => <div><h2 className="text-xl text-white">{i18n?.t("Error")}</h2><br />{this.state.error}</div>, {
                autoClose: false
            });
        }
    }

    handleInputChange(event: { target: any; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        } as State);
    }

    async handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        let serverUrl = this.state.serverUrl;
        // Reset url if the field is hidden.
        if (!this.state.showServerField) {
            serverUrl = constMatrixArtServer + "/_matrix/client";
        }
        if (serverUrl === "" || serverUrl === constMatrixArtServer) {
            serverUrl = constMatrixArtServer + "/_matrix/client";
        } else if (this.state.showServerField && !serverUrl.endsWith("/_matrix/client") && !serverUrl.endsWith("/_matrix/client/")) {
            serverUrl = serverUrl + "/_matrix/client";
        }

        if (this.state.mxid && this.state.password) {
            this.setState({
                loading: true
            });
            await this.context.client?.login(serverUrl, this.state.mxid, this.state.password, true);
            if (this.state.generateProfile) {
                try {
                    await this.context.client?.followUser(`#${this.context.client?.userId}`);
                } catch (error: any) {
                    this.setState(
                        { error: error.message }
                    );
                }
                try {
                    const token = await this.context.client?.getOpenidToken();
                    const resp = await fetch("/api/directory", {
                        method: "POST", body: JSON.stringify({
                            access_token: token,
                            user_id: this.context.client?.userId,
                            user_room: `#${this.context.client?.userId}`
                        })
                    });
                    const body = await resp.json();
                    if (body.error_code) {
                        if (body.error_code !== "001") {
                            console.log(body.error);
                        }
                    }
                } catch (error: any) {
                    this.setState(
                        { error: `Failed to reach your server to verify your user: ${error.message}` }
                    );
                    return;
                }

            }
            await this.props.router.replace("/");
        }
    }

    render(): ReactNode {
        const { loading, showServerField, serverUrl, mxid, password, generateProfile } = this.state;
        if (loading) {
            return (
                <>
                    <Head>
                        <title key="title">Matrix Art | {i18n?.t("Login")}</title>
                        <meta property="og:title" content="Matrix Art | Login" key="og-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <div className='z-[100] sticky lg:top-20 top-56 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                        <div className='h-16 px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                            <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>{i18n?.t("Log In")}</h1>
                        </div>
                    </div>
                    <div className="mx-auto w-full">
                        <div className="loader">{i18n?.t("Loading")}...</div>
                    </div>
                </>
            );
        }
        //TODO make better
        return (
            <>
                <Head>
                    <title key="title">Matrix Art | {i18n?.t("Login")}</title>
                    <meta property="og:title" content="Matrix Art | Login" key="og-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <div className='z-[100] sticky lg:top-20 top-56 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                    <div className='h-16 px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                        <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>{i18n?.t("Log In")}</h1>
                    </div>
                </div>
                <div className="flex items-center justify-center m-10">
                    <form onSubmit={this.handleSubmit} className="w-96 grid grid-cols-1 gap-6">
                        <div className="block">
                            <div className="mt-2 flex justify-between items-center">
                                <label className="inline-flex items-center">
                                    <input className="cursor-pointer h-4 w-4" type="checkbox" name="showServerField" checked={showServerField} onChange={this.handleInputChange} />
                                    <span className="ml-2 text-gray-700 dark:text-gray-400">{i18n?.t("Use custom Server")}</span>
                                </label>
                                <Link href="/resetPassword"><a className="text-gray-900 dark:text-gray-200 hover:text-teal-400">{i18n?.t("Forgot Password")}</a></Link>
                            </div>
                        </div>

                        <label style={{
                            transition: 'opacity 0.4s ease',
                            opacity: showServerField ? 1 : 0,
                            display: showServerField ? 'block' : 'none'
                        }} id="homeserverField">
                            <span className="text-gray-900 dark:text-gray-200 visually-hidden">{i18n?.t("Homeserver:")}</span>
                            <div className="mt-1 w-full flex flex-row box-border items-center cursor-text">
                                <input placeholder={i18n?.t("Homeserver")} className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-9000" type="text" name="serverUrl" value={serverUrl} onChange={this.handleInputChange} />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-gray-900 dark:text-gray-200 visually-hidden">{i18n?.t("Username:")}</span>
                            <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300">
                                <input placeholder={i18n?.t("Username")} autoComplete="username" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="mxid" value={mxid} onChange={this.handleInputChange} />
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-gray-900 dark:text-gray-200 visually-hidden">{i18n?.t("Password:")}</span>
                            <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300">
                                <input placeholder={i18n?.t("Password")} autoComplete="current-password" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="password" name="password" value={password} onChange={this.handleInputChange} />
                            </div>
                        </label>

                        <div className="block">
                            <div className="mt-2 flex justify-between items-center">
                                <label className="inline-flex items-center">
                                    <input className="cursor-pointer h-4 w-4" type="checkbox" name="generateProfile" checked={generateProfile} onChange={this.handleInputChange} />
                                    <span className="ml-2 text-gray-700 dark:text-gray-400">{i18n?.t("Create a full profile? (Cant be done later currently. This is WIP)")}</span>
                                </label>
                            </div>
                        </div>

                        <input className="bg-teal-400 hover:bg-teal-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200" type="submit" value="Log In" />
                    </form>
                </div>
            </>
        );
    }
}

Login.contextType = ClientContext;


export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        }
    };
};

export default withRouter(Login);
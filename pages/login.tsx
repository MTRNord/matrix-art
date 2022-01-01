import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component, ReactNode } from "react";
import { RingLoader } from "react-spinners";
import { ClientContext } from "../components/ClientContext";
import Header from "../components/Header";
import { constMatrixArtServer } from "../helpers/matrix_client";
import { centerSpinner } from "./Home";

type Props = {
    router: NextRouter;
};
type State = {
    showServerField: boolean;
    serverUrl: string;
    mxid?: string;
    password?: string;
    serverFieldsDisplay: string;
    serverFieldsOpacity: number;
    loading: boolean;
};

class Login extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            showServerField: false,
            serverUrl: constMatrixArtServer + "/_matrix/client",
            serverFieldsDisplay: 'none',
            serverFieldsOpacity: 0,
            loading: false,
        } as State;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event: { target: any; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        if (name == "showServerField") {
            if (this.state.serverFieldsDisplay === 'none') {
                this.setState({ serverFieldsDisplay: 'block' });
                setTimeout(() =>
                    this.setState({ serverFieldsOpacity: 1 }), 10 // something very short
                );
            }
            if (this.state.serverFieldsDisplay === 'block') {
                this.setState({ serverFieldsOpacity: 0 });
                setTimeout(() =>
                    this.setState({ serverFieldsDisplay: 'none' }), 400 // same as transition time
                );
            }
        }
        this.setState({
            [name]: value
        } as State);
    }

    async handleSubmit(event: { preventDefault: () => void; }) {
        // TODO update client
        event.preventDefault();
        let serverUrl = this.state.serverUrl;
        // Reset url if the field is hidden.
        if (!this.state.showServerField) {
            serverUrl = constMatrixArtServer + "/_matrix/client";
        }

        if (this.state.mxid && this.state.password) {
            this.setState({
                loading: true
            });
            await this.context.client.login(serverUrl, this.state.mxid, this.state.password, true);
            this.props.router.replace("/");
        }
    }

    render(): ReactNode {
        const { loading } = this.state;
        if (loading) {
            return (
                <>
                    <div className='h-full bg-[#f8f8f8] dark:bg-[#06070D]'>
                        <Head>
                            <title key="title">Matrix Art | Login</title>
                            <meta property="og:title" content="Matrix Art | Login" key="og-title" />
                            <meta property="og:type" content="website" key="og-type" />
                        </Head>
                        <Header></Header>
                        <main className="lg:pt-[108px] pt-[216px]">
                            <div className='z-[100] sticky lg:top-[108px] top-[216px] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                                <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                                    <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Log In</h1>
                                </div>
                            </div>
                            {/* TODO fix loader */}
                        </main>
                    </div>
                </>
            );
        }
        return (
            <>
                <div className='h-full bg-[#f8f8f8] dark:bg-[#06070D]'>
                    <Head>
                        <title key="title">Matrix Art | Login</title>
                        <meta property="og:title" content="Matrix Art | Login" key="og-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>

                    <main className='lg:pt-[108px] pt-[216px]'>
                        <div className='z-[100] sticky lg:top-[108px] top-[216px] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                            <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                                <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Log In</h1>
                            </div>
                        </div>
                        <div className="flex items-center justify-center m-10">
                            <form onSubmit={this.handleSubmit} className="grid grid-cols-1 gap-6">
                                <div className="block">
                                    <div className="mt-2">
                                        <div>
                                            <label className="inline-flex items-center">
                                                <input className="cursor-pointer h-[16px] w-[16px]" type="checkbox" name="showServerField" checked={this.state.showServerField} onChange={this.handleInputChange} />
                                                <span className="ml-2 text-gray-900 dark:text-gray-200">Use custom Server</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <label style={{
                                    transition: 'opacity 0.4s ease',
                                    opacity: this.state.serverFieldsOpacity,
                                    display: this.state.serverFieldsDisplay
                                }} id="homeserverField">
                                    <span className="text-gray-900 dark:text-gray-200">Homeserver:</span>
                                    <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400">
                                        <input className="bg-transparent min-w-[20px] focus:outline-none flex-[1] border-none text-gray-900 dark:text-gray-200" type="text" name="serverUrl" value={this.state.serverUrl} onChange={this.handleInputChange} />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-gray-900 dark:text-gray-200">Username:</span>
                                    <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400">
                                        <input className="bg-transparent min-w-[20px] focus:outline-none flex-[1] border-none text-gray-900 dark:text-gray-200" type="text" name="mxid" value={this.state.mxid} onChange={this.handleInputChange} />
                                    </div>
                                </label>
                                <label className="block">
                                    <span className="text-gray-900 dark:text-gray-200">Password:</span>
                                    <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400">
                                        <input className="bg-transparent min-w-[20px] focus:outline-none flex-[1] border-none text-gray-900 dark:text-gray-200" type="password" name="password" value={this.state.password} onChange={this.handleInputChange} />
                                    </div>
                                </label>


                                <input className="bg-teal-400 hover:bg-teal-500 cursor-pointer h-[42px] rounded dark:text-gray-900 text-gray-200" type="submit" value="Log In" />
                            </form>
                        </div>
                    </main>
                </div>
            </>
        );
    }
}

Login.contextType = ClientContext;
export default withRouter(Login);
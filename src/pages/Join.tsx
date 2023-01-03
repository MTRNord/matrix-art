import React, { PureComponent } from "react";
import { Client } from "../context";
import { Header } from "../components/header";
import { MatrixClient } from "../matrix/client";
import { NavigateFunction } from "react-router-dom";
import { withNavigateHOC } from "../components/hookHelpers";

type Props = {
    navigate: NavigateFunction;
};

type State = {
    homeserver: string;
    username: string;
    password: string;
    create_profile: boolean;
    current_tab: "login" | "register";
};

const ACTIVE_TAB_CSS = "inline-block p-4 w-full text-gray-900 bg-gray-100 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:bg-gray-700 dark:text-white";
const TAB_CSS = "inline-block p-4 w-full bg-white hover:text-gray-700 hover:bg-gray-50 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700";

class Join extends PureComponent<Props, State> {
    static contextType = Client;
    declare context: React.ContextType<typeof Client>;

    constructor(props: Props) {
        super(props);
        this.state = {
            homeserver: "https://art.midnightthoughts.space",
            username: "",
            password: "",
            create_profile: true,
            current_tab: "login"
        };
    }

    async onSubmit(e: React.FormEvent) {
        const client: MatrixClient | undefined = this.context;
        if (!client) {
            return;
        }
        if (this.state.homeserver === "" || this.state.username === "" || this.state.password === "") {
            return;
        }
        if (this.state.current_tab === "login" && !client?.isLoggedIn()) {
            await client.login(this.state.homeserver, this.state.username, this.state.password, this.state.create_profile);
        } else if (this.state.current_tab === "register" && !client.isLoggedIn()) {
            await client.register(this.state.homeserver, this.state.username, this.state.password, this.state.create_profile);
        }
        this.props.navigate('/', { replace: true });
    }

    onInput(e: React.FormEvent) {
        const target = (e.target as HTMLInputElement);
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({ [name]: value } as State);
    }

    render() {
        const { homeserver, username, password, create_profile: create_account, current_tab } = this.state;
        return (
            <div className="flex flex-col">
                <header>
                    <Header />
                </header>

                <main className="m-12 mt-6">
                    <h1 className="text-3xl font-bold mb-4 text-white">Join</h1>
                    <div className="flex items-center flex-col">
                        <ul className="w-1/4 mb-8 hidden text-sm font-medium text-center text-gray-500 rounded-lg divide-x divide-gray-200 shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
                            <li className="w-full">
                                <a href="#" className={current_tab === "login" ? `${ACTIVE_TAB_CSS} rounded-l-lg` : `${TAB_CSS} rounded-l-lg`} onClick={(e) => { e.preventDefault(); this.setState({ current_tab: "login" }); }}>Login</a>
                            </li>
                            <li className="w-full">
                                <a href="#" className={current_tab === "register" ? `${ACTIVE_TAB_CSS} rounded-r-lg` : `${TAB_CSS} rounded-r-lg`} onClick={(e) => { e.preventDefault(); this.setState({ current_tab: "register" }); }}>Register</a>
                            </li>
                        </ul>
                        <form onSubmit={this.onSubmit.bind(this)} className="flex flex-col items-start w-1/4">
                            <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" type="url" placeholder="Homeserver" name="homeserver" value={homeserver} onInput={this.onInput.bind(this)} />
                            <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" autoComplete="username" type="text" placeholder="Username" name="username" value={username} onInput={this.onInput.bind(this)} />
                            <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" autoComplete="current-password" type="password" placeholder="Password" name="password" value={password} onInput={this.onInput.bind(this)} />
                            <label className="mb-4 flex items-center">
                                <input className="checked:bg-blue-600 checked:border-transparent checked:bg-no-repeat checked:bg-[url('/tick.svg')] outline-none focus:outline-offset-2  focus:ring-blue-600  focus:ring-offset-2  focus:ring-offset-white p-0 inline-block align-middle box-border select-none shrink-0 shadow h-5 w-5 appearance-none rounded bg-white border-none" type="checkbox" name="create_profile" checked={create_account} onChange={this.onInput.bind(this)} />
                                <span className="ml-4 text-data text-base font-medium">Create account</span>
                            </label>

                            <button type="submit" className="text-white font-bold text-lg logo-bg rounded-xl py-2 px-10 shadow transform transition-transform ease-in-out duration-300 hover:scale-105 w-1/2 self-center justify-center flex">{current_tab === "login" ? "Login" : "Register"}</button>
                        </form>
                    </div>
                </main >
            </div >
        );
    }
}


Join.contextType = Client;
export default withNavigateHOC(Join);
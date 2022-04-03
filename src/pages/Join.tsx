import { PureComponent } from "preact/compat";
import { Client } from "../context";
import { Header } from "../components/header";
import { MatrixClient } from "../matrix/client";
import { route } from "preact-router";

type State = {
    homeserver: string;
    username: string;
    password: string;
    create_profile: boolean;
    current_tab: "login" | "register";
};

const ACTIVE_TAB_CSS = "inline-block p-4 w-full text-gray-900 bg-gray-100 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:bg-gray-700 dark:text-white";
const TAB_CSS = "inline-block p-4 w-full bg-white hover:text-gray-700 hover:bg-gray-50 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700";

export default class Join extends PureComponent<any, State> {
    constructor() {
        super();
        this.state = {
            homeserver: "https://art.midnightthoughts.space",
            username: "",
            password: "",
            create_profile: true,
            current_tab: "login"
        };
    }

    async onSubmit(e: Event) {
        e.preventDefault();
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
        route('/', true);
    }

    onInput(e: Event) {
        e.preventDefault();
        const target = (e.target as HTMLInputElement);
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({ [name]: value });
    }
    render(_: any, { homeserver, username, password, create_profile: create_account, current_tab }: State) {
        return (
            <div class="flex flex-col">
                <header>
                    <Header />
                </header>

                <main class="m-12 mt-6">
                    <h1 class="text-3xl font-bold mb-4 text-white">Join</h1>
                    <div class="flex items-center flex-col">
                        <ul class="w-1/4 mb-8 hidden text-sm font-medium text-center text-gray-500 rounded-lg divide-x divide-gray-200 shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
                            <li class="w-full">
                                <a href="#" class={current_tab === "login" ? `${ACTIVE_TAB_CSS} rounded-l-lg` : `${TAB_CSS} rounded-l-lg`} onClick={(e) => { e.preventDefault(); this.setState({ current_tab: "login" }); }}>Login</a>
                            </li>
                            <li class="w-full">
                                <a href="#" class={current_tab === "register" ? `${ACTIVE_TAB_CSS} rounded-r-lg` : `${TAB_CSS} rounded-r-lg`} onClick={(e) => { e.preventDefault(); this.setState({ current_tab: "register" }); }}>Register</a>
                            </li>
                        </ul>
                        <form onSubmit={this.onSubmit.bind(this)} class="flex flex-col items-start w-1/4">
                            <input class="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" type="url" placeholder="Homeserver" name="homeserver" value={homeserver} onInput={this.onInput.bind(this)} />
                            <input class="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" autocomplete="username" type="text" placeholder="Username" name="username" value={username} onInput={this.onInput.bind(this)} />
                            <input class="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder-data text-white mb-4 w-full" autoComplete="current-password" type="password" placeholder="Password" name="password" value={password} onInput={this.onInput.bind(this)} />
                            <label class="mb-4 flex items-center">
                                <input class="checked:bg-blue-600 checked:border-transparent checked:bg-no-repeat checked:bg-[url('/tick.svg')] outline-none focus:outline-offset-2  focus:ring-blue-600  focus:ring-offset-2  focus:ring-offset-white p-0 inline-block align-middle box-border select-none shrink-0 shadow h-5 w-5 appearance-none rounded bg-white border-none" type="checkbox" name="create_profile" checked={create_account} onInput={this.onInput.bind(this)} />
                                <span class="ml-4 text-data text-base font-medium">Create account</span>
                            </label>

                            <button type="submit" class="text-white font-bold text-lg logo-bg rounded-xl py-2 px-10 shadow transform transition-transform ease-in-out duration-300 hover:scale-105 w-1/2 self-center">{current_tab === "login" ? "Login" : "Register"}</button>
                        </form>
                    </div>
                </main >
            </div >
        );
    }
}


Join.contextType = Client;
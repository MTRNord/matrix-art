import { Link } from "preact-router";
import { PureComponent } from "preact/compat";
import { Client } from "../context";
import { MatrixClient } from "../matrix/client";

export class Header extends PureComponent {
    render() {
        const client: MatrixClient | undefined = this.context;
        return (
            <div class="m-12 flex flex-col lg:flex-row items-center justify-between">
                <Link href="/"><img alt="Matrix Art" src="Logo_colored.svg" class="ease-in-out hover:scale-105 trandform transition-transform duration-300" /></Link>
                <div class="flex items-center mt-8 lg:mt-0 flex-col sm:flex-row">
                    <div class="flex items-center justify-between w-80 max-w-80 mx-6 ease-in-out hover:scale-105 trandform transition-transform duration-300">
                        <div class="absolute ml-4">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#AAB3CF">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </div>
                        <input class="search-bg shadow rounded-2xl border-0 py-3 px-4 pl-10 text-data" placeholder="Search"></input>
                    </div>
                    {

                        !client?.isLoggedIn() ? <Link href="/join" class="text-white font-bold text-1xl logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transform transition-transform ease-in-out duration-300 hover:scale-105">Join</Link> :
                            <Link class="text-white font-bold text-1xl logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transform transition-transform ease-in-out duration-300 hover:scale-105">Post</Link>
                    }

                </div>
            </div>
        );
    }
}

Header.contextType = Client;
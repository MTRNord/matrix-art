import { PureComponent } from "preact/compat";

export class Header extends PureComponent {
    render() {
        return (
            <div class="m-12 flex flex-col lg:flex-row items-center justify-between">
                <img alt="Matrix Art" src="Logo_colored.svg" />
                <div class="flex items-center mt-8 lg:mt-0 flex-col sm:flex-row">
                    <div class="flex items-center justify-between w-80 max-w-80 mx-6">
                        <div class="absolute ml-4">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#AAB3CF">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </div>
                        <input class="search-bg shadow rounded-2xl border-0 py-3 px-4 pl-10 text-data" placeholder="Search"></input>
                    </div>
                    <button class="text-white font-bold text-1xl logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0">Join</button>
                </div>
            </div>
        );
    }
}
import Link from "next/link";
import { PureComponent } from "react";
import { ClientContext } from "./ClientContext";

export default class Header extends PureComponent {
    declare context: React.ContextType<typeof ClientContext>;
    render() {
        return (
            <>
                <header className='bg-[#f8f8f8] dark:bg-[#06070D] flex fixed top-0 left-0 right-0 lg:h-20 h-auto z-[100] items-center lg:flex-row flex-col shadow-black drop-shadow-xl'>
                    <span className='flex items-center lg:mx-10 lg:my-auto my-4 text-gray-900 dark:text-gray-200 font-bold cursor-pointer'>
                        <Link href="/" passHref>
                            <svg id="matrix-art-logo" width="8.75rem" className="fill-gray-900 dark:fill-gray-200" viewBox="0 0 400 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M105.578 67.4062C101.016 76.5312 94.5312 81.0938 86.125 81.0938C77.7812 81.0938 71.8125 75.4688 68.2188 64.2188C65.8438 56.7812 64.6562 47.7188 64.6562 37.0312C64.6562 33.0625 64.8125 28.8594 65.125 24.4219C59 36.3906 54.2344 48.2188 50.8281 59.9062H32.875L32.9219 24.3281C26.8594 36.3281 22.2031 48.1875 18.9531 59.9062H0.015625C12.6094 41.1875 22.5312 21.3125 29.7812 0.28125H48.5312C46.7188 11.5938 45.7656 23.4375 45.6719 35.8125C51.6719 23.4688 57.1406 11.625 62.0781 0.28125H83.4062C80.0625 8.84375 78.3906 17.9688 78.3906 27.6562C78.3906 28.875 78.4375 30.3906 78.5312 32.2031C78.8438 38.4844 79.2969 43.2031 79.8906 46.3594C80.7656 51.0469 82.2344 55.5156 84.2969 59.7656C87.7031 66.7656 91.7344 70.2656 96.3906 70.2656C101.141 70.2656 104.203 69.3125 105.578 67.4062Z" fill="inherit" />
                                <path d="M132.062 18.8438C126.781 32.5312 122.609 46.2188 119.547 59.9062H103.844L104.547 57.6094C101.516 59.3281 98.4062 60.1875 95.2188 60.1875C91 60.1875 87.7031 58.7344 85.3281 55.8281C83.1094 53.1406 82 49.6406 82 45.3281C82 38.7656 84.1562 32.75 88.4688 27.2812C93.0938 21.4375 98.5781 18.5156 104.922 18.5156C109.578 18.5156 112.969 20 115.094 22.9688L116.359 18.8438H132.062ZM110.547 33.8906C110.547 30.6094 108.938 28.9688 105.719 28.9688C103.438 28.9688 101.422 29.9375 99.6719 31.875C97.9219 33.8125 97.0469 35.9375 97.0469 38.25C97.0469 41.6875 98.75 43.4062 102.156 43.4062C104.562 43.4062 106.594 42.4062 108.25 40.4062C109.781 38.5312 110.547 36.3594 110.547 33.8906Z" fill="inherit" />
                                <path d="M167.547 18.5156L163.656 31.4531C160.344 31.3281 157.141 31.2188 154.047 31.125C151.234 40.4062 148.953 50 147.203 59.9062H130C132.844 52.625 136.016 43.0156 139.516 31.0781C136.234 31.1719 133.062 31.2969 130 31.4531L133.938 18.5156C136.844 18.6719 139.891 18.7812 143.078 18.8438C144.453 13.8438 145.891 8.5 147.391 2.8125H164.734C162.328 8.09375 160.141 13.4375 158.172 18.8438C161.172 18.75 164.297 18.6406 167.547 18.5156Z" fill="inherit" />
                                <path d="M206.641 29.2969C204.828 28.3906 201.641 27.9375 197.078 27.9375C193.484 27.9375 190.469 28.9688 188.031 31.0312C185.344 33.3125 181.656 42.6875 176.969 59.1562H176.922L176.688 59.9062H160.984L173.453 18.8438H180.391C182.297 18.0312 184.531 17.625 187.094 17.625C192.312 17.625 198.828 21.5156 206.641 29.2969Z" fill="inherit" />
                                <path d="M231.812 9.65625C231.812 11.8125 230.531 13.5469 227.969 14.8594C225.906 15.9219 223.672 16.4531 221.266 16.4531C218.828 16.4531 216.547 15.9219 214.422 14.8594C211.859 13.5781 210.578 11.8281 210.578 9.60938C210.578 7.39062 211.953 5.64062 214.703 4.35938C216.891 3.32812 219.234 2.8125 221.734 2.8125C224.203 2.8125 226.391 3.32812 228.297 4.35938C230.641 5.64062 231.812 7.40625 231.812 9.65625ZM226.375 18.8438L213.906 59.9062H198.203L210.672 18.8438H226.375Z" fill="inherit" />
                                <path d="M271.188 18.8438L250.141 39.9375L258.672 59.9062H244.562L240.203 49.8281L230.125 59.9062H214.469L235.562 38.8594L226.984 18.8438H241.141L245.453 28.9688L255.578 18.8438H271.188Z" fill="inherit" />
                                <path d="M345.344 67.4062C340.781 76.5312 334.312 81.0938 325.938 81.0938C318.719 81.0938 313.266 77.25 309.578 69.5625C306.984 64.1562 305.375 57.1719 304.75 48.6094H294.297C292.953 52.4219 291.719 56.1875 290.594 59.9062H272.078C283.859 38.7188 293.797 18.8438 301.891 0.28125H323.219C319.844 8.875 318.156 18 318.156 27.6562C318.156 28.875 318.203 30.3906 318.297 32.2031C318.609 38.5469 319.062 43.2656 319.656 46.3594C320.531 51.0156 322 55.4844 324.062 59.7656C327.438 66.7656 331.469 70.2656 336.156 70.2656C340.906 70.2656 343.969 69.3125 345.344 67.4062ZM304.984 24.2344C302.766 28.5156 300.734 32.7969 298.891 37.0781H304.469C304.5 33.0781 304.672 28.7969 304.984 24.2344Z" fill="inherit" />
                                <path d="M366.203 29.2969C364.391 28.3906 361.203 27.9375 356.641 27.9375C353.047 27.9375 350.031 28.9688 347.594 31.0312C344.906 33.3125 341.219 42.6875 336.531 59.1562H336.484L336.25 59.9062H320.547L333.016 18.8438H339.953C341.859 18.0312 344.094 17.625 346.656 17.625C351.875 17.625 358.391 21.5156 366.203 29.2969Z" fill="inherit" />
                                <path d="M399.766 18.5156L395.875 31.4531C392.562 31.3281 389.359 31.2188 386.266 31.125C383.453 40.4062 381.172 50 379.422 59.9062H362.219C365.062 52.625 368.234 43.0156 371.734 31.0781C368.453 31.1719 365.281 31.2969 362.219 31.4531L366.156 18.5156C369.062 18.6719 372.109 18.7812 375.297 18.8438C376.672 13.8438 378.109 8.5 379.609 2.8125H396.953C394.547 8.09375 392.359 13.4375 390.391 18.8438C393.391 18.75 396.516 18.6406 399.766 18.5156Z" fill="inherit" />
                            </svg>
                        </Link>
                    </span>
                    <div className='flex lg:flex-1 items-center justify-between lg:flex-row flex-col'>
                        <div className='flex grow items-center'>
                            <form className='w-52 text-gray-900 dark:text-gray-200'>
                                <div className='flex flex-row box-border items-center cursor-text duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400'>
                                    <input className='bg-transparent min-w-[1.25rem] focus:outline-none flex-[1] border-none' type="text" placeholder='Search & Discover' />
                                    <span className='flex items-center justify-center cursor-pointer'>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" className='fill-gray-900 dark:fill-gray-200'><path d="M0 0h24v24H0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                                    </span>
                                </div>
                            </form>
                        </div>

                        <nav className='flex lg:flex-shrink-0 my-4'>
                            {this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/register">Join</Link></span> : undefined}
                            {this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/login">Log in</Link></span> : undefined}
                            {!this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href={"/profile/" + encodeURIComponent(this.context.client.userId!)}>Profile</Link></span> : undefined}
                            {!this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/logout/">Logout</Link></span> : undefined}
                        </nav>
                    </div>
                    <span className='lg:opacity-100 opacity-0 inline-block bg-gray-900 dark:bg-gray-200 w-[1px] lg:h-7 h-0'></span>
                    <div className='relative lg:m-0'>
                        <div className='flex'>
                            <a className='inline-flex justify-center items-center text-teal-400 hover:text-teal-200 bg-transparent relative h-14 min-w-[9.25rem] z-[2] cursor-pointer font-bold'>Submit</a>
                        </div>
                    </div>
                </header>
            </>
        );
    }
}
Header.contextType = ClientContext;
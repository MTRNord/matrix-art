import Link from "next/link";
import { PureComponent } from "react";
import { ClientContext } from "./ClientContext";

export default class Header extends PureComponent {
    declare context: React.ContextType<typeof ClientContext>;
    render() {
        return (
            <>
                <header className='bg-[#f8f8f8] dark:bg-[#06070D] flex fixed top-0 left-0 right-0 bottom-0 lg:h-20 h-52 z-[100] items-center lg:flex-row flex-col shadow-black drop-shadow-xl'>
                    <span className='flex items-center h-full lg:mx-10 my-auto text-gray-900 dark:text-gray-200 font-bold'><Link href="/">Matrix Art</Link></span>
                    <div className='flex flex-1 items-center lg:flex-row flex-col'>
                        <div className='flex grow-[1] h-full relative items-center'>
                            <form className='w-52 text-gray-900 dark:text-gray-200'>
                                <div className='flex flex-row box-border items-center cursor-text duration-300 rounded-sm border dark:border-slate-400 border-slate-500 py-1.5 px-2 focus-within:border-teal-400'>
                                    <input className='bg-transparent min-w-[1.25rem] focus:outline-none flex-[1] border-none' type="text" placeholder='Search & Discover' />
                                    <span className='inline-flex items-center justify-center cursor-pointer'>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" className='fill-gray-900 dark:fill-gray-200'><path d="M0 0h24v24H0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                                    </span>
                                </div>
                            </form>
                        </div>

                        <nav className='flex flex-shrink-0 relative mr-0 h-full'>
                            {this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/register">Join</Link></span> : undefined}
                            {this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href="/login">Log in</Link></span> : undefined}
                            {!this.context.client.isGuest ? <span className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium'><Link href={"/profile/" + encodeURIComponent(this.context.client.userId!)}>Profile</Link></span> : undefined}
                        </nav>
                    </div>
                    <span className='lg:opacity-100 opacity-0 inline-block bg-gray-900 dark:bg-gray-200 w-[1px] h-7'></span>
                    <div className='relative lg:m-0 mt-4'>
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
import Link from "next/link";
import { PureComponent } from "react";

export default class Footer extends PureComponent {
    render() {
        return (
            <footer className="w-full lg:min-h-[25rem] min-h-[12.5rem] bg-[#FEFEFE] dark:bg-[#12161D] flex lg:flex-row flex-col justify-center items-center z-0">
                <Link href={`https://github.com/MTRNord/matrix-art`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Github</a></Link>
                <Link href={`https://matrix.to/#/#matrix-art:nordgedanken.dev`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Matrix</a></Link>
                <Link href={`/profile/${encodeURIComponent("@mtrnord:nordgedanken.dev")}`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Developer</a></Link>
            </footer>
        );
    }
}
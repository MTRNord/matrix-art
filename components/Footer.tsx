import Link from "next/link";
import { PureComponent } from "react";

export default class Footer extends PureComponent {
    render() {
        return (
            <footer className="relative left-0 right-0 bottom-0 h-[25rem] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95] flex justify-center items-center">
                <Link href={`https://github.com/MTRNord/matrix-art`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Github</a></Link>
                <Link href={`https://matrix.to/#/#matrix-art:nordgedanken.dev`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Matrix</a></Link>
                <Link href={`/profile/${encodeURIComponent("@mtrnord:nordgedanken.dev")}`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">Developer</a></Link>
            </footer>
        );
    }
}
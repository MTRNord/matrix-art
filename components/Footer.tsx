import Link from "next/link";
import { PureComponent } from "react";
import { i18n } from 'next-i18next';

export default class Footer extends PureComponent {
    render() {
        return (
            <footer className="w-full lg:min-h-[25rem] min-h-[12.5rem] bg-[#FEFEFE] dark:bg-[#12161D] flex lg:flex-row flex-col justify-center items-center z-0">
                <Link href={`https://github.com/MTRNord/matrix-art`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">{i18n?.t('Github')}</a></Link>
                <Link href={`https://matrix.to/#/#matrix-art:nordgedanken.dev`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">{i18n?.t('Matrix')}</a></Link>
                <Link href={`/profile/${encodeURIComponent("@mtrnord:nordgedanken.dev")}`} passHref><a className="px-16 text-lg text-gray-700 dark:text-gray-400 font-bold">{i18n?.t('Developer')}</a></Link>
            </footer>
        );
    }
}
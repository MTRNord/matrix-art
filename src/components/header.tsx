import { Link } from "react-router-dom";
import { useContext } from "react";
import { Client } from "../context";
import logo_url from "./Logo_colored.svg";
import { useTranslation } from "react-i18next";

export function Header() {
    const client = useContext(Client);
    const { t } = useTranslation();

    return (
        <div className="m-12 flex flex-col lg:flex-row items-center justify-between">
            <Link to="/"><img alt="Matrix Art" src={logo_url} /></Link>
            <div className="flex items-center mt-8 lg:mt-0 flex-col sm:flex-row">
                <div className="flex items-center lg:justify-between w-80 mx-6 ease-in-out hover:scale-105 transition-transform duration-300">
                    <div className="absolute ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#AAB3CF">
                            <path d="M0 0h24v24H0V0z" fill="none" />
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                    </div>
                    <input className="search-bg shadow rounded-2xl border-0 py-3 px-4 pl-12 text-data" placeholder={t("Search") as string}></input>
                </div>
                {

                    client?.isLoggedIn() ? <Link to="/" className="text-white font-bold logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transition-transform ease-in-out duration-300 hover:scale-105">{t('Post')}</Link> :
                        <Link to="/join" className="text-white font-bold logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transition-transform ease-in-out duration-300 hover:scale-105">{t('Join')}</Link>
                }

            </div>
        </div>
    );
}
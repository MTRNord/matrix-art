import React, { useState, useContext } from "react";
import { Client } from "../context";
import { Header } from "../components/header";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ACTIVE_TAB_CSS = "inline-block p-4 w-full text-gray-900 bg-gray-100 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:bg-gray-700 dark:text-white";
const TAB_CSS = "inline-block p-4 w-full bg-white hover:text-gray-700 hover:bg-gray-50 hover:ring-blue-300 hover:ring-1 focus:ring-transparent focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700";

export default function Join() {
    const navigate = useNavigate();
    const client = useContext(Client);
    const [homeserver, setHomeserver] = useState(import.meta.env.VITE_MATRIX_SERVER_URL);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [createProfile, setCreateProfile] = useState(true);
    const [currentTab, setCurrentTab] = useState("login");
    const { t } = useTranslation();

    const onSubmit = async (_e: React.FormEvent) => {
        if (!client) {
            return;
        }
        if (homeserver === "" || username === "" || password === "") {
            return;
        }
        if (currentTab === "login" && !client?.isLoggedIn()) {
            await client.login(homeserver, username, password, createProfile);
        } else if (currentTab === "register" && !client.isLoggedIn()) {
            await client.register(homeserver, username, password, createProfile);
        }
        navigate('/', { replace: true });
    }

    const onInput = (e: React.FormEvent) => {
        const target = (e.target as HTMLInputElement);
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        switch (name) {
            case "homeserver": {
                setHomeserver(value as string);
                break;
            }
            case "username": {
                setUsername(value as string);
                break;
            }
            case "password": {
                setPassword(value as string);
                break;
            }
            case "createProfile": {
                setCreateProfile(value as boolean);
                break;
            }
        }
    }

    return (
        <div className="flex flex-col">
            <header>
                <Header />
            </header>

            <main className="m-12 mt-6">
                <h1 className="text-3xl font-bold mb-4 text-white">{t('Join')}</h1>
                <div className="flex items-center flex-col">
                    <ul className="w-1/4 mb-8 hidden text-sm font-medium text-center text-gray-500 rounded-lg divide-x divide-gray-200 shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
                        <li className="w-full">
                            <a href="#" className={currentTab === "login" ? `${ACTIVE_TAB_CSS} rounded-l-lg` : `${TAB_CSS} rounded-l-lg`} onClick={(_e) => { setCurrentTab("login"); }}>{t('Login')}</a>
                        </li>
                        <li className="w-full">
                            <a href="#" className={currentTab === "register" ? `${ACTIVE_TAB_CSS} rounded-r-lg` : `${TAB_CSS} rounded-r-lg`} onClick={(_e) => { setCurrentTab("register"); }}>{t('Register')}</a>
                        </li>
                    </ul>
                    <form onSubmit={onSubmit} className="flex flex-col items-start w-1/4">
                        <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder:text-data text-white mb-4 w-full" type="url" placeholder={t("Homeserver") as string} name="homeserver" value={homeserver} onInput={onInput} />
                        <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder:text-data text-white mb-4 w-full" autoComplete="username" type="text" placeholder={t("Username") as string} name="username" value={username} onInput={onInput} />
                        <input className="search-bg shadow rounded-lg border-0 py-3 px-4 placeholder:text-data text-white mb-4 w-full" autoComplete="current-password" type="password" placeholder={t("Password") as string} name="password" value={password} onInput={onInput} />
                        <label className="mb-4 flex items-center">
                            <input className="checked:bg-blue-600 checked:border-transparent checked:bg-no-repeat checked:bg-[url('/tick.svg')] outline-none focus:outline-offset-2  focus:ring-blue-600  focus:ring-offset-2  focus:ring-offset-white p-0 inline-block align-middle box-border select-none shrink-0 shadow h-5 w-5 appearance-none rounded bg-white border-none" type="checkbox" name="createProfile" checked={createProfile} onChange={onInput} />
                            <span className="ml-4 text-data text-base font-medium">{t('Create account')}</span>
                        </label>

                        <button type="submit" className="text-white font-bold text-lg logo-bg rounded-xl py-2 px-10 shadow transition-transform ease-in-out duration-300 hover:scale-105 w-1/2 self-center justify-center flex">{currentTab === "login" ? t("Login") : t("Register")}</button>
                    </form>
                </div>
            </main >
        </div >
    );
}
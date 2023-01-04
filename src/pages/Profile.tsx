import React from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/header";

export default function Profile() {
    const { userId } = useParams();
    return (
        <div className="flex flex-col">
            <header>
                <Header />
            </header>

            <main className="m-12 mt-6">

            </main>
        </div>
    );
}
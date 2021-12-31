import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component, ReactNode } from "react";
import Header from "../../components/Header";

interface Props {
    router: NextRouter;
}

class Post extends Component<Props> {
    render() {
        const post_title = "";
        return (
            <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                <Head>
                    <title key="title">Matrix Art | {post_title}</title>
                </Head>
                <Header></Header>
            </div>
        );
    }
}
export default withRouter(Post);
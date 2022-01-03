import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { Component } from "react";
import { ClientContext } from "../../components/ClientContext";
import Header from "../../components/Header";

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
    router: NextRouter;
};

type State = {
    displayname: string;
};

class Profile extends Component<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);

        this.state = {
            displayname: this.props.mxid
        } as State;
    }

    async componentDidMount() {
        if (!this.props.mxid) {
            return;
        }
        try {
            const profile = await this.context.client.getProfile(this.props.mxid);
            this.setState({
                displayname: profile.displayname,
            });
        } catch (ex) {
            console.debug(`Failed to fetch profile for user ${this.props.mxid}:`, ex);
        }
    }

    render() {
        if (!this.props.mxid || !this.props.mxid?.startsWith("@")) {
            return (
                <div className="h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]">
                    <Head>
                        <title key="title">Matrix Art | User not Found</title>
                        <meta property="og:title" content="Matrix Art | User not Found" key="og-title" />
                        <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                        <meta name="twitter:title" content="Matrix Art | User not Found" key="og-twitter-title" />
                        <meta property="og:type" content="website" key="og-type" />
                    </Head>
                    <Header></Header>
                    <main className='h-full lg:pt-[108px] pt-[216px] z-0 flex items-center justify-center'>
                        <h1 className="text-6xl text-gray-900 dark:text-gray-200 font-bold">The User you wanted does not exist!</h1>
                    </main>
                </div>
            );
        }
        return (
            <div className="h-full bg-[#f8f8f8] dark:bg-[#06070D]">
                <Head>
                    <title key="title">Matrix Art | {this.state.displayname}</title>
                    <meta property="og:title" content={`Matrix Art | ${this.state.displayname}`} key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content={`Matrix Art | ${this.state.displayname}`} key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='lg:pt-[108px] pt-[216px] z-0'>
                    <div className='z-[100] sticky lg:top-[108px] top-[216px] bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                        <div className='h-[72px] px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                            <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>{"User – " + this.state.displayname}</h1>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

}
Profile.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query, res } = context;
    const mxid = decodeURIComponent(query.userid as string);

    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    if (mxid && mxid.startsWith("@")) {
        try {

            return {
                props: {
                    mxid: mxid
                }
            };
        } catch (error) {
            return { notFound: true, props: {} };
        }
    }
    return { notFound: true, props: {} };

};

export default withRouter(Profile);
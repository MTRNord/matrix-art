import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import { PureComponent, ReactNode } from "react";
import { FileRejection } from "react-dropzone";
import { toast } from "react-toastify";
import { ClientContext } from "../components/ClientContext";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MainSubmissionForm from "../components/submit_page/main";
import { DropCallbacks, StartSubmit } from "../components/submit_page/start";

type Props = {
    router: NextRouter;
};

type State = {
    files: PreviewWithDataFile[];
    fileRejections: FileRejection[];
    error?: string;
    submitState: "start" | "editing";
};

export type PreviewWithDataFile = File & {
    preview_url: string;
};

class Submit extends PureComponent<Props, State> implements DropCallbacks {
    declare context: React.ContextType<typeof ClientContext>;
    onDrop: (files: File[]) => void;
    onDropError: (fileRejections: FileRejection[]) => void;

    async componentDidMount() {
        if (this.context.client.isGuest) {
            this.props.router.replace("/login");
        }
    }

    constructor(props: Props) {
        super(props);
        this.onDrop = async (files: File[]) => {
            const files_mapped = await Promise.all(files.map(async file => Object.assign(file, {
                preview_url: URL.createObjectURL(file)
            }))) as PreviewWithDataFile[];
            let newState: "start" | "editing";
            switch (this.state.submitState) {
                case "start": {
                    newState = "editing";
                    break;
                }
                default: {
                    newState = this.state.submitState;
                    break;
                }
            }
            this.setState({
                submitState: newState,
                files: [...this.state.files, ...files_mapped]
            });
        };

        this.onDropError = (fileRejections: FileRejection[]) => {
            const newRejections = fileRejections.filter(x => !this.state.fileRejections.includes(x));
            if (newRejections.length > 0) {
                let errors = "";
                for (const rejection of newRejections) {
                    if (errors === "") {
                        errors = `${rejection.file.name} - ${rejection.errors.join(" & ")}`;
                    } else {
                        errors = `${errors}\n${rejection.file.name} - ${rejection.errors.join(" & ")}`;
                    }
                }
                this.setState({
                    error: errors
                });
            }
            this.setState({ fileRejections: newRejections });
        };
        this.state = {
            files: [],
            fileRejections: [],
            submitState: "start"
        };
    }
    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.error && this.state.error !== prevState.error) {
            toast(() => <div><h2 className="text-xl text-white">Error</h2><br />{this.state.error}</div>, {
                autoClose: false
            });
        }
    }

    render(): ReactNode {
        return (
            <div className='min-h-full flex flex-col bg-[#f8f8f8] dark:bg-[#06070D]'>
                <Head>
                    <title key="title">Matrix Art | Submit Post</title>
                    <meta property="og:title" content="Matrix Art | Submit Post" key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content="Matrix Art | Submit Post" key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <div className='z-[100] sticky lg:top-[4.9rem] top-[12.5rem] bg-[#fefefe]/[.95] dark:bg-[#12161D]'>
                    <div className='h-16 px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                        <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Submit Image</h1>
                    </div>
                </div>
                {this.renderStage()}
                <div className="flex-grow"></div>
                <Footer></Footer>
            </div>
        );
    }
    renderStage(): ReactNode {
        switch (this.state.submitState) {
            case "start": {
                return <StartSubmit onDrop={this.onDrop} onDropError={this.onDropError} />;
            }
            case "editing":
                return <MainSubmissionForm onDrop={this.onDrop} onDropError={this.onDropError} files={this.state.files} />;
            default: {
                return <></>;
            }
        }
    }
}

Submit.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['common'])),
        }
    };
};

export default withRouter(Submit);
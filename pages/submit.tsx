import Head from "next/head";
import { PureComponent, ReactNode } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { ClientContext } from "../components/ClientContext";
import Header from "../components/Header";

type Props = {};

type State = {
    files: PreviewWithDataFile[];
    fileRejections: FileRejection[];
    error?: string;
};

type PreviewWithDataFile = File & {
    preview: HTMLImageElement;
    data: ArrayBuffer;
};

class Submit extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;
    onDrop: (files: File[]) => void;

    constructor(props: Props) {
        super(props);
        this.onDrop = async (files: File[]) => {
            const files_mapped = await Promise.all(files.map(async file => Object.assign(file, {
                preview: await this.readFileToSizes(file),
                data: await this.readFileToArray(file),
            }))) as PreviewWithDataFile[];
            this.setState({
                files: [...this.state.files, ...files_mapped]
            });
        };
        this.state = {
            files: [],
            fileRejections: []
        };
    }

    readFileToSizes(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                const img = new Image();
                // Save as we use readAsDataURL
                img.src = fr.result as string;

                resolve(img);
            };
            fr.onerror = reject;
            fr.readAsDataURL(file);
        });
    }

    readFileToArray(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result as ArrayBuffer);
            };
            fr.onerror = reject;
            fr.readAsArrayBuffer(file);
        });
    }

    onDropError(fileRejections: FileRejection[]) {
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
    }

    renderThumbs() {
        return this.state.files.map(file => (
            <div className="relative cursor-pointer  border-2 border-solid border-[#eeeeea] p-1" style={{ height: "212px" }} key={file.name}>
                <img className="h-auto w-full object-cover max-w-full align-bottom" style={{ height: "200px" }} src={file.preview.src} width={file.preview.width} height={file.preview.height} />
            </div>
        ));
    }

    render(): ReactNode {
        return (
            <div className='min-h-full bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
                <Head>
                    <title key="title">Matrix Art | Submit Post</title>
                    <meta property="og:title" content="Matrix Art | Submit Post" key="og-title" />
                    <meta name="twitter:card" content="summary_large_image" key="og-twitter" />
                    <meta name="twitter:title" content="Matrix Art | Submit Post" key="og-twitter-title" />
                    <meta property="og:type" content="website" key="og-type" />
                </Head>
                <Header></Header>
                <main className='w-full lg:pt-20 pt-52 z-0'>
                    <div className="flex justify-center items-center mt-4">
                        <Dropzone accept='image/*' onDropAccepted={this.onDrop} onDropRejected={this.onDropError}>
                            {({ getRootProps, getInputProps }) => (
                                <section className="flex flex-col">
                                    <div className="dark:bg-[#fefefe]/[.25] bg-[#14181E]/[.25] min-h-[11.5rem] min-w-[39.5rem] flex-[1] flex flex-col items-center justify-center p-5 border-2 rounded-sm border-[#eeeeee] border-dashed outline-none focus:border-[#2196f3] duration-[24ms] transition" {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <p className="text-base text-gray-900 dark:text-gray-200">Drag &apos;n&apos; drop some images here, or click to select images</p>
                                    </div>
                                    <ul className="flex flex-row flex-wrap gap-1 mt-4 max-w-[50rem] justify-evenly">
                                        {this.renderThumbs()}
                                        <li className='grow-[10]'></li>
                                    </ul>
                                </section>
                            )}
                        </Dropzone>
                    </div>
                </main>
            </div>
        );
    }
}

Submit.contextType = ClientContext;

export default Submit;
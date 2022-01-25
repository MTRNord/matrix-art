import { PureComponent } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import PropTypes from 'prop-types';

export interface DropCallbacks {
    onDrop: (files: File[]) => void;
    onDropError: (fileRejections: FileRejection[]) => void;
}

interface Props extends DropCallbacks { }

export class StartSubmit extends PureComponent<Props> {
    static propTypes = {
        onDrop: PropTypes.func,
        onDropError: PropTypes.func
    };

    render() {
        return (
            <main className='min-h-full flex flex-col justify-center lg:pt-20 pt-52 z-0 bottom-0 relative flex-grow mb-8'>
                <div className="flex justify-center items-center mt-4">
                    <Dropzone accept='image/*' onDropAccepted={this.props.onDrop} onDropRejected={this.props.onDropError}>
                        {({ getRootProps, getInputProps }) => (
                            <section className="flex flex-col">
                                <div className="dark:bg-[#fefefe]/[.25] bg-[#14181E]/[.25] min-h-[11.5rem] min-w-[39.5rem] flex-[1] flex flex-col items-center justify-center p-5 border-2 rounded-sm border-[#eeeeee] border-dashed outline-none hover:border-[#2196f3] duration-[24ms] transition" {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p className="text-base text-gray-900 dark:text-gray-200">Drag &apos;n&apos; drop some images here, or click to select images</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                </div>
            </main>
        );
    }
}
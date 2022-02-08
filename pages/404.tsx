import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { PureComponent, ReactNode } from "react";

class Custom404 extends PureComponent {
    render(): ReactNode {
        return (
            <div className="m-0 w-full">
                <div className="text-base text-white flex flex-row justify-center">
                    <h1 className="text-2xl">404 - Page Not Found</h1>
                </div>
            </div>
        );
        return;
    }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common']))
        }
    };

};

export default Custom404;
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextRouter, withRouter } from "next/router";
import { PureComponent } from "react";
import { ClientContext } from "../components/ClientContext";

type Props = {
    router: NextRouter;
};
type State = {

};

class Logout extends PureComponent<Props, State> {
    declare context: React.ContextType<typeof ClientContext>;

    constructor(props: Props | Readonly<Props>) {
        super(props);
    }

    async componentDidMount() {
        if (typeof window !== "undefined") {
            if (!this.context.client.isGuest) {
                await this.context.client.logout(false);
            }
        }
        await this.props.router.replace("/");
    }
    render() {
        return <></>;
    }
}

Logout.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        }
    };
};

export default withRouter(Logout);
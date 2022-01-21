import { NextRouter, withRouter } from "next/router";
import { PureComponent, ReactNode } from "react";
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
        if (!this.context.client.isGuest) {
            await this.context.client.logout(false);
        }
        if (typeof window !== "undefined") {
            window.location.reload();
        }
        await this.props.router.replace("/");
    }
    render() {
        return <></>;
    }
}

Logout.contextType = ClientContext;
export default withRouter(Logout);
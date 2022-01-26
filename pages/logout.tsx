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

            window.location.reload();
            await this.props.router.replace("/");
        }
    }
    render() {
        return <></>;
    }
}

Logout.contextType = ClientContext;
export default withRouter(Logout);
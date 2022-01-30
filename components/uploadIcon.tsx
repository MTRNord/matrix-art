import { PureComponent } from "react";
import PropTypes from 'prop-types';

type Props = {
    onClick?: () => void;
    className?: string;
};

type State = {
    onClick: () => void;
    className: string;
};

export class UploadIcon extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            className: (props.className || "") + " dark:fill-white fill-black",
            onClick: props.onClick || (() => {/*noop*/ })
        };
    }

    static propTypes = {
        onClick: PropTypes.func,
        className: PropTypes.string
    };

    render() {
        return (
            <svg className={this.state.className} onClick={this.state.onClick} xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="inherit">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
            </svg>
        );
    }
}
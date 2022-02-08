import { PureComponent } from "react";
import PropTypes from 'prop-types';

type Props = {
    onClick?: () => void;
    className?: string;
};

type State = {
    className: string;
    onClick: () => void;
};

export class EditIcon extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            className: (props.className ?? "") + " dark:fill-white fill-black",
            onClick: props.onClick ?? (() => {/*noop*/ })
        };
    }
    static propTypes = {
        onClick: PropTypes.func,
        className: PropTypes.string
    };

    render() {
        return (
            <svg className={this.state.className} onClick={this.state.onClick} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
        );
    }
}
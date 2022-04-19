import { useNavigate } from "react-router-dom";

export const withNavigateHOC = (Component: any) => {
    return (props: any) => {
        const navigate = useNavigate();

        return <Component navigate={navigate} {...props} />;
    };
};
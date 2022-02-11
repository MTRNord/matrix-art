import React, { Context } from "react";
import MatrixClient from "../helpers/matrix_client";

type ContextData = {
    client?: MatrixClient;
    guest_client?: MatrixClient;
    is_generating_guest: boolean;
};

const ClientContext: Context<ContextData> = React.createContext<ContextData>({
    client: undefined,
    guest_client: undefined,
    is_generating_guest: false
});

export { ClientContext };
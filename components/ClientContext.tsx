import React from "react";
import Client from "../helpers/matrix_client";
import Storage from "../helpers/storage";

const client = new Client(new Storage());
const ClientContext = React.createContext<undefined | { client: Client; }>(undefined);

export { ClientContext, client };
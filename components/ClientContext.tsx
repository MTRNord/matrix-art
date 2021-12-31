import React, { Context } from "react";
import Client from "../helpers/matrix_client";
import Storage from "../helpers/storage";

const client = new Client(new Storage());
const ClientContext: Context<{ client: Client; }> = React.createContext<{ client: Client; }>({ client: client });

export { ClientContext, client };
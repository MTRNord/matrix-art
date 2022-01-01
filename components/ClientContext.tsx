import React, { Context } from "react";
import Client from "../helpers/matrix_client";
import Storage from "../helpers/storage";

// Actual user client
const client = new Client(new Storage("main"));

// Client used if logged in for the Homepage to prevent excessive room joining
const guest_client = new Client(new Storage("guest"));
const ClientContext: Context<{ client: Client; guest_client: Client; }> = React.createContext<{ client: Client; guest_client: Client; }>({ client: client, guest_client: guest_client });

export { ClientContext, client, guest_client };
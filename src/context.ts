import { MatrixClient } from "./matrix/client";
import { createContext } from "preact/compat";

export const Client = createContext<MatrixClient | undefined>(undefined);
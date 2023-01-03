import { MatrixClient } from "./matrix/client";
import { createContext } from "react";

export const Client = createContext<MatrixClient | undefined>(undefined);
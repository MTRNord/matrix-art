// Helper method to wait for a middleware to execute before continuing

import { CorsRequest } from 'cors';
import { NextApiResponse } from "next";

// And to throw an error when an error happens in a middleware
export default function initMiddleware<T extends CorsRequest = CorsRequest>(middleware: (
    req: T,
    res: {
        statusCode?: number | undefined;
        setHeader(key: string, value: string): any;
        end(): any;
    },
    next: (err?: any) => any,
) => void) {
    return (req: T, res: NextApiResponse) =>
        new Promise((resolve, reject) => {
            middleware(req, res, (result) => {
                if (result instanceof Error) {
                    return reject(result);
                }
                return resolve(result);
            });
        });
}
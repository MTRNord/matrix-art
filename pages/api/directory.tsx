import Cors from 'cors';
import initMiddleware from '../../helpers/init-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import PouchDB from 'pouchdb';
import path from 'node:path';
import ServerOpenID from '../../helpers/ss-well-known';

const db = new PouchDB(path.join(process.cwd(), "matrix-art-db"));

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET, POST, DELETE and OPTIONS
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    })
);

export const get_data = async () => {
    if (process.env.PLAYWRIGHT === '1') {
        console.log("Running in tests!");
        return [
            {
                "user_id": "@mtrnord:art.midnightthoughts.space",
                "user_room": "#@mtrnord:art.midnightthoughts.space",
                "_id": "@mtrnord:art.midnightthoughts.space"
            }
        ];
    }
    const db_resp = await db.allDocs({ include_docs: true });
    const db_data: { _id: string; user_id: string; user_room: string; _rev?: string; }[] = db_resp.rows.map(x => x.doc) as unknown as { _id: string; user_id: string; user_room: string; _rev?: string; }[];
    for (const entry of db_data) {
        delete entry._rev;
    }
    return db_data;
};

// TODO this is fully insecured. Make sure to use OpenID or something to verify the user of this.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Run cors
    await cors(req, res);

    if (req.method == "GET") {
        try {
            const db_data = await get_data();
            res.status(200).json({ data: db_data });
        } catch (error) {
            res.status(502).json({});
            console.error(error);
        }
    } else if (req.method == "POST") {
        const data: {
            user_id: string;
            user_room: string;
            access_token: string;
        } = req.body;
        if (await (new ServerOpenID().verify(data.user_id, data.access_token))) {
            const db_data = {
                _id: data.user_id,
                user_id: data.user_id,
                user_room: data.user_room,
            };
            try {
                await db.put(db_data);
                res.status(200).json({});
            } catch (error) {
                res.status(502).json({});
                console.error(error);
            }
        } else {
            res.status(401).json({});
        }



    } else if (req.method == "DELETE") {
        const data: {
            user_id: string;
            access_token: string;
        } = req.body;
        if (await (new ServerOpenID().verify(data.user_id, data.access_token))) {
            try {
                const db_data = await db.get(data.user_id);
                await db.remove(db_data);
                res.status(200).json({});
            } catch (error) {
                res.status(502).json({});
                console.error(error);
            }
        } else {
            res.status(401).json({});
        }
    } else {
        res.status(405).json({});
    }
}
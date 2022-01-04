import Cors from 'cors';
import initMiddleware from '../../helpers/init-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import PouchDB from 'pouchdb';
import path from 'path';

const db = new PouchDB(path.join(process.cwd(), "matrix-art-db"));

// Initialize the cors middleware
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
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
    const db_data: { _id: string; user_id: string; user_room: string; _rev?: string; }[] = (await db.allDocs({ include_docs: true })).rows.map(x => x.doc) as unknown as { _id: string; user_id: string; user_room: string; _rev?: string; }[];
    db_data.forEach(x => delete x?._rev);
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
        } catch (err) {
            res.status(502).json({});
            console.error(err);
        }
    } else if (req.method == "POST") {
        const data: {
            user_id: string;
            user_room: string;
        } = req.body;
        const db_data = {
            _id: data.user_id,
            user_id: data.user_id,
            user_room: data.user_room,
        };
        try {
            await db.put(db_data);
            res.status(200).json({});
        } catch (err) {
            res.status(502).json({});
            console.error(err);
        }

    } else if (req.method == "DELETE") {
        const data: {
            user_id: string;
        } = req.body;
        console.log(data.user_id);
        try {
            const db_data = await db.get(data.user_id);
            await db.remove(db_data);
            res.status(200).json({});
        } catch (err) {
            res.status(502).json({});
            console.error(err);
        }

    } else {
        res.status(405).json({});
    }
}
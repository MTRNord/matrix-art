import initMiddleware from "../../helpers/init-middleware";
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from "next";
import MeiliSearch from "meilisearch";
import ServerOpenID from "../../helpers/ss-well-known";

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET, POST, DELETE and OPTIONS
        methods: ['POST', 'OPTIONS'],
    })
);

// TODO solve index for gallery
export type SearchMedia = {
    event_id: string;
    title: string;
    description: string;
    tags: string;
    license: string;
    sender: string;
    nsfw: string;
    mxc_url?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = new MeiliSearch({
        host: process.env.SEARCH_URL ?? 'http://127.0.0.1:7700', apiKey: process.env.MEILI_MASTER_KEY ?? 'xxx'
    });

    // Run cors
    await cors(req, res);

    if (req.method !== "POST") {
        res.status(405).json({});
        return;
    }


    const data: {
        docs: SearchMedia[];
        access_token?: string;
        user_id?: string;
    } = JSON.parse(req.body);

    if (await (new ServerOpenID().verify(data.user_id!, data.access_token!))) {
        data.docs.map(doc => {
            doc.event_id = doc.event_id.replace("$", "");
            return doc;
        });
        await client.index('posts').addDocuments(data.docs);
        res.status(200).json({});
        return;
    } {
        res.status(401).json({});
        return;
    }
}
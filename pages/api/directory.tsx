import Cors from 'cors';
import initMiddleware from '../../helpers/init-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import ServerOpenID from '../../helpers/ss-well-known';
import { Sequelize } from 'sequelize-typescript';
import User from '../../helpers/db/Users';

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET, POST, DELETE and OPTIONS
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    })
);

export const get_data = async () => {
    const db = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(process.cwd(), "matrix-art-db/db.sqlite")
    });
    db.addModels([User]);
    if (process.env.PLAYWRIGHT === '1') {
        console.log("Running in tests!");
        return [
            new User({
                "mxid": "@mtrnord:art.midnightthoughts.space",
                "public_user_room": "#@mtrnord:art.midnightthoughts.space"
            })
        ];
    }
    await User.sync();
    return await User.findAll();
};

// TODO this is fully insecured. Make sure to use OpenID or something to verify the user of this.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Run cors
    await cors(req, res);

    const db = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(process.cwd(), "matrix-art-db.sqlite")
    });
    db.addModels([User]);
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

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
        } = JSON.parse(req.body);
        if (await (new ServerOpenID().verify(data.user_id, data.access_token))) {
            try {
                await User.sync();
                await User.create({
                    mxid: data.user_id,
                    public_user_room: data.user_room
                });
                res.status(201).json({});
            } catch (error: any) {
                if (error.status === 409 && error.name === "conflict") {
                    res.status(200).json({ "error": "User already existed", "error_code": "001" });
                }
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
        } = JSON.parse(req.body);
        if (await (new ServerOpenID().verify(data.user_id, data.access_token))) {
            try {
                await User.sync();
                await User.destroy({
                    where: {
                        mxid: data.user_id
                    }
                });
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


    await db.close();
}
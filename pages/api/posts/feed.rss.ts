import initMiddleware from "../../../helpers/init-middleware";
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from "next";
import { Feed } from "feed";
import { get_data } from "../directory";
import { client } from "../../../components/ClientContext";
import { constMatrixArtServer } from "../../../helpers/matrix_client";
import { MatrixImageEvents } from "../../../helpers/event_types";
import { isImageGalleryEvent } from "../../../components/FrontPageImage";

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET and OPTIONS
        methods: ['GET', 'OPTIONS'],
    })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run cors
    await cors(req, res);

    if (req.method !== "GET") {
        res.status(504);
    }

    res.setHeader("content-type", "application/rss+xml");
    const feed = new Feed({
        title: "Matrix-Art",
        description: "Matrix-Art is a Devianart style application for posting media based on Matrix.",
        id: "https://" + (req.headers.host || "art.midnightthoughts.space"),
        link: "https://" + (req.headers.host || "art.midnightthoughts.space"),
        language: "en",
        copyright: "",
        feed: "https://" + (req.headers.host || "art.midnightthoughts.space") + "/posts.rss"
    });

    try {
        const directory = await get_data();

        if (!client?.accessToken) {
            try {
                let serverUrl = constMatrixArtServer + "/_matrix/client";
                await client?.registerAsGuest(serverUrl);
            } catch (error) {
                console.error("Failed to register as guest:", error);
                return {
                    props: {
                        image_events: []
                    }
                };
            }
        }
        let image_events: MatrixImageEvents[] = [];
        // TODO fix this somehow. It is super inefficent.
        for (let user of directory) {
            // We dont need many events
            const roomId = await client?.followUser(user.user_room);
            const events = await client?.getTimeline(roomId, 100);
            // Filter events by type
            let images = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[];
            images = await Promise.all(images.map(async (image) => {
                try {
                    const profile = await client.getProfile(image.sender);
                    image.content.displayname = profile.displayname;
                } catch {
                    image.content.displayname = image.sender;
                }
                return image;
            }));
            image_events = [...image_events, ...images];
            console.log("Adding", image_events.length, "items");
        }

        for (let imageEvent of image_events) {
            feed.addContributor({
                name: imageEvent.content.displayname
            });
            if (isImageGalleryEvent(imageEvent)) {
                for (let image of imageEvent.content["m.image_gallery"]) {
                    feed.addItem({
                        title: image["m.text"],
                        id: "https://" + (req.headers.host || "art.midnightthoughts.space") + "/post/" + imageEvent.event_id + "_" + image["m.file"].url,
                        link: "https://" + (req.headers.host || "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                        description: "",
                        content: "",
                        author: [
                            {
                                name: imageEvent.content.displayname,
                            }
                        ],
                        // TODO extract real time
                        date: new Date(),
                        image: client?.downloadLink(image["m.file"].url)
                    });
                }
            } else {
                feed.addItem({
                    title: imageEvent.content["m.text"],
                    id: "https://" + (req.headers.host || "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                    link: "https://" + (req.headers.host || "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                    description: "",
                    content: "",
                    author: [
                        {
                            name: imageEvent.content.displayname,
                        }
                    ],
                    date: new Date(),
                    image: client?.downloadLink(imageEvent.content["m.file"].url)
                });
            }

        }

    } catch { }

    feed.addCategory("Photography");
    feed.addCategory("Media");
    feed.addCategory("Images");
    feed.addCategory("SocialMedia");
    res.status(200).send(feed.atom1());
}
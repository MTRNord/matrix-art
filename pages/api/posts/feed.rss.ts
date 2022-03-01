import initMiddleware from "../../../helpers/init-middleware";
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from "next";
import { Feed } from "feed";
import { get_data } from "../directory";
import MatrixClient, { constMatrixArtServer } from "../../../helpers/matrix_client";
import { MatrixImageEvents } from "../../../helpers/event_types";
import { isImageGalleryEvent } from "../../../components/FrontPageImage";
import Storage from "../../../helpers/storage";

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
        description: "Matrix-Art is an image gallery for Matrix.",
        id: "https://" + (req.headers.host ?? "art.midnightthoughts.space"),
        link: "https://" + (req.headers.host ?? "art.midnightthoughts.space"),
        language: "en",
        copyright: "",
        feed: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/posts.rss",
        namespaces: {
            "xmlns:creativeCommons": "http://backend.userland.com/creativeCommonsRssModule",
            "xmlns:media": "https://search.yahoo.com/mrss/"
        }
    });

    try {
        const directory = await get_data();
        const client = await MatrixClient.init(await Storage.init("main"));

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
        // TODO fix this somehow. It is super inefficient.
        for (let user of directory) {
            // We dont need many events
            const roomId = await client?.followUser(user.public_user_room);
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
                        id: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/post/" + imageEvent.event_id + "_" + image["m.file"].url,
                        link: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                        description: `<img src="${client?.downloadLink(image["m.file"].url)!}"/>`,
                        author: [
                            {
                                name: imageEvent.content.displayname,
                                link: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/profile/" + imageEvent.sender
                            }
                        ],
                        // TODO extract real time
                        date: new Date(imageEvent.origin_server_ts),
                        image: {
                            url: client?.downloadLink(image["m.file"].url)!,
                            type: image["m.file"].mimetype,
                            length: image["m.file"].size
                        },
                        extra: {
                            'media:content': {
                                _attributes: {
                                    url: client?.downloadLink(image["m.file"].url)!,
                                    type: image["m.file"].mimetype,
                                    medium: 'image',
                                    height: image["m.image"].height,
                                    width: image["m.image"].width,
                                },
                                'media:credit': {
                                    _attributes: {
                                        role: "author",
                                        scheme: "urn:ebu"
                                    },
                                    _text: imageEvent.content.displayname,
                                }
                            },
                            'media:keywords': image["matrixart.tags"].join(", "),
                            'media:rating': "nonadult",
                            'media:title': {
                                _attributes: {
                                    type: "plain"
                                },
                                _text: image["m.text"],
                            },
                            'creativeCommons:license': "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                            'media:license': {
                                _attributes: {
                                    href: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                                    type: "text/html"
                                },
                                _text: "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)"
                            }
                        }
                    });
                }
            } else {
                feed.addItem({
                    title: imageEvent.content["m.text"],
                    id: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                    link: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/post/" + imageEvent.event_id,
                    description: `<img src="${client?.downloadLink(imageEvent.content["m.file"].url)!}"/>`,
                    author: [
                        {
                            name: imageEvent.content.displayname,
                            link: "https://" + (req.headers.host ?? "art.midnightthoughts.space") + "/profile/" + imageEvent.sender
                        }
                    ],
                    date: new Date(imageEvent.origin_server_ts),
                    image: {
                        url: client?.downloadLink(imageEvent.content["m.file"].url)!,
                        type: imageEvent.content["m.file"].mimetype,
                        length: imageEvent.content["m.file"].size
                    },
                    extra: {
                        'media:content': {
                            _attributes: {
                                url: client?.downloadLink(imageEvent.content["m.file"].url)!,
                                type: imageEvent.content["m.file"].mimetype,
                                medium: 'image',
                                height: imageEvent.content["m.image"].height,
                                width: imageEvent.content["m.image"].width,
                            },
                            'media:credit': {
                                _attributes: {
                                    role: "author",
                                    scheme: "urn:ebu"
                                },
                                _text: imageEvent.content.displayname,
                            }
                        },
                        'media:keywords': imageEvent.content["matrixart.tags"].join(", "),
                        'media:rating': "nonadult",
                        'media:title': {
                            _attributes: {
                                type: "plain"
                            },
                            _text: imageEvent.content["m.text"],
                        },
                        'creativeCommons:license': "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                        'media:license': {
                            _attributes: {
                                href: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                                type: "text/html"
                            },
                            _text: "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)"
                        }
                    }
                });
            }
        }
    } catch {
        /*noop*/
    }

    feed.addCategory("Photography");
    feed.addCategory("Media");
    feed.addCategory("Images");
    feed.addCategory("SocialMedia");
    res.status(200).send(feed.rss2());
}
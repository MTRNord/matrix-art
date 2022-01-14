export type MatrixEventBase = {
    type: string;
    event_id: string;
    room_id: string;
    sender: string;
    redacted_because: any | undefined;
    origin_server_ts: number;
};

export type FileEvent = {
    url: string;
    name: string;
    mimetype: string;
    size: number;
};

export type ThumbnailFileEvent = ImageFields & {
    url: string;
    mimetype: string;
    size: number;
};

export type ImageFields = {
    width: number;
    height: number;
};

export type ImageEventContent = {
    // TODO maybe not correct as it may be formatted?
    "m.text": string;
    "m.file": FileEvent;
    "m.image": ImageFields;
    "m.thumbnail": ThumbnailFileEvent[];
    "matrixart.tags": string[];
    "xyz.amorgan.blurhash": string;
};

export type MessageAlike = { "m.text": string; } | { body: string; mimetype: string; };
export type ImageEventContentWithCaption = ImageEventContent & {
    "m.caption": MessageAlike[];
    // Fake values
    displayname?: string;
};

export type ImageEvent = MatrixEventBase & {
    content: ImageEventContentWithCaption;
};


export type ImageGalleryContent = {
    "m.image_gallery": ImageEventContent[];
    "m.caption": MessageAlike[];
    // Fake values
    displayname?: string;
};

export type ImageGalleryEvent = MatrixEventBase & {
    content: ImageGalleryContent;
};

export type BannerEventContent = {
    "m.text": string;
    "m.file": FileEvent;
    "m.image": ImageFields;
};

export type BannerEvent = MatrixEventBase & {
    content: BannerEventContent;
};

export type MatrixImageEvents = ImageEvent | ImageGalleryEvent;
export type MatrixEvent = MatrixImageEvents | BannerEvent;
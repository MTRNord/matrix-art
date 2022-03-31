import {
    ExtensibleEvents,
    IPartialEvent,
    Optional,
    UnstableValue,
    EventType,
    isEventTypeSame,
    isProvided,
    M_TEXT,
    InvalidEventError,
    isOptionalAString,
    NamespacedValue,
    M_MESSAGE_EVENT_CONTENT,
    EitherAnd,
    M_TEXT_EVENT,
    ExtensibleEvent
} from "matrix-events-sdk";

export const M_IMAGE = new UnstableValue("m.image", "org.matrix.msc1767.image");
export const M_FILE = new UnstableValue("m.file", "org.matrix.msc1767.file");
export const M_THUMBNAIL = new UnstableValue("m.thumbnail", "org.matrix.msc1767.thumbnail");
export const M_BLURHASH = new UnstableValue("blurhash", "xyz.amorgan.blurhash");
export const MATRIX_ART_DESCRIPTION = new NamespacedValue("matrixart.description");
export const MATRIX_ART_TAGS = new NamespacedValue("matrixart.tags");
export const MATRIX_ART_NSFW = new NamespacedValue("matrixart.nsfw");
export const MATRIX_ART_LICENSE = new NamespacedValue("matrixart.license");

type ThumbnailFileEvent = ImageFields & {
    url: string;
    mimetype: string;
    size: number;
};

type ImageFields = {
    width: number;
    height: number;
};

type FileEvent = {
    url: string;
    name: string;
    mimetype: string;
    size: number;
};

export type M_IMAGE_EVENT = EitherAnd<{ [M_IMAGE.name]: ImageFields; }, { [M_IMAGE.altName]: ImageFields; }>;
export type M_FILE_EVENT = EitherAnd<{ [M_FILE.name]: FileEvent; }, { [M_FILE.altName]: FileEvent; }>;
export type M_THUMBNAIL_EVENT = EitherAnd<{ [M_THUMBNAIL.name]: ThumbnailFileEvent[]; }, { [M_THUMBNAIL.altName]: ThumbnailFileEvent[]; }>;
export type M_BLURHASH_EVENT = EitherAnd<{ [M_BLURHASH.name]: string; }, { [M_BLURHASH.altName]: string; }>;
export type MATRIX_ART_TAGS_EVENT = { ["matrixart.tags"]: string[]; };
export type MATRIX_ART_DESCRIPTION_EVENT = { ["matrixart.description"]: string; };
export type MATRIX_ART_NSFW_EVENT = { ["matrixart.nsfw"]: boolean; };
export type MATRIX_ART_LICENSE_EVENT = { ["matrixart.license"]: string; };
export type M_IMAGE_EVENT_CONTENT = M_MESSAGE_EVENT_CONTENT
    & M_IMAGE_EVENT
    & M_FILE_EVENT
    & M_TEXT_EVENT
    | M_BLURHASH_EVENT
    | M_THUMBNAIL_EVENT
    | MATRIX_ART_TAGS_EVENT
    | MATRIX_ART_DESCRIPTION_EVENT
    | MATRIX_ART_NSFW_EVENT
    | MATRIX_ART_LICENSE_EVENT;

class ImageEvent extends ExtensibleEvent<M_IMAGE_EVENT_CONTENT> {
    public readonly image!: ImageFields;
    public readonly text!: string;
    public readonly thumbnails?: ThumbnailFileEvent[];
    public readonly blurhash?: string;
    public readonly file!: FileEvent;
    public readonly description?: string;
    public readonly tags?: string[];
    public readonly nsfw: boolean = false;
    public readonly license?: string;


    public isEquivalentTo(primaryEventType: EventType): boolean {
        return isEventTypeSame(primaryEventType, M_IMAGE);
    }
    public serialize(): IPartialEvent<object> {
        const content: M_IMAGE_EVENT_CONTENT = {
            [M_TEXT.name]: this.text,
            [M_FILE.name]: this.file,
            [M_IMAGE.name]: this.image,
            [M_THUMBNAIL.name]: this.thumbnails,
            [M_BLURHASH.name]: this.blurhash,
            ["matrixart.description"]: this.description,
            ["matrixart.tags"]: this.tags,
            ["matrixart.nsfw"]: this.nsfw,
            ["matrixart.license"]: this.license,
        };

        return {
            type: "m.image",
            content: content,
        };
    }

    constructor(wireFormat: IPartialEvent<M_IMAGE_EVENT_CONTENT>) {
        super(wireFormat);

        const mimage = M_IMAGE.findIn<ImageFields>(this.wireContent);
        // Probably wrong
        const mtext = M_TEXT.findIn<string>(this.wireContent);
        const mfile = M_FILE.findIn<FileEvent>(this.wireContent);
        const mthumbnail = M_THUMBNAIL.findIn<ThumbnailFileEvent[]>(this.wireContent);
        const mblurhash = M_BLURHASH.findIn<string>(this.wireContent);
        const matrixart_description = MATRIX_ART_DESCRIPTION.findIn<string>(this.wireContent);
        const matrixart_tags = MATRIX_ART_TAGS.findIn<string[]>(this.wireContent);
        const matrixart_nsfw = MATRIX_ART_NSFW.findIn<boolean>(this.wireContent);
        const matrixart_license = MATRIX_ART_LICENSE.findIn<string>(this.wireContent);

        // Required fields
        if (isProvided(mimage)) {
            if (!mimage) {
                throw new InvalidEventError("m.image is required to be present");
            }
            this.image = mimage;
        }
        if (isProvided(mfile)) {
            if (!mfile) {
                throw new InvalidEventError("m.file is required to be present");
            }
            this.file = mfile;
        }
        if (isOptionalAString(mtext)) {
            if (!mimage) {
                throw new InvalidEventError("m.text is required to be present");
            }
            // Safe but ts is stupid here
            this.text = mtext as string;
        }

        // Optional fields
        if (isProvided(mthumbnail)) {
            if (!Array.isArray(mthumbnail)) {
                throw new InvalidEventError("m.thumbnail contents must be an array");
            }
            this.thumbnails = mthumbnail;
        }
        if (isOptionalAString(mblurhash)) {
            this.blurhash = mblurhash as string;
        }
        if (isOptionalAString(matrixart_description)) {
            this.description = matrixart_description as string;
        }
        if (isProvided(matrixart_tags)) {
            if (!Array.isArray(matrixart_tags)) {
                throw new InvalidEventError("matrixart.tags contents must be an array");
            }
            this.tags = matrixart_tags;
        }
        if (isProvided(matrixart_nsfw)) {
            if (typeof matrixart_nsfw !== "boolean") {
                throw new InvalidEventError("matrixart.tags contents must be an boolean");
            }
            this.nsfw = matrixart_nsfw;
        }
        if (isOptionalAString(matrixart_license)) {
            this.license = matrixart_license as string;
        }
    }
}

function parseImageEvent(wireEvent: IPartialEvent<object>): Optional<ImageEvent> {
    const event = wireEvent as IPartialEvent<M_IMAGE_EVENT_CONTENT>;
    return new ImageEvent(event);
}

ExtensibleEvents.registerInterpreter(M_IMAGE, parseImageEvent);
ExtensibleEvents.unknownInterpretOrder.push(M_IMAGE);
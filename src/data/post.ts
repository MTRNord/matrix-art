import { ImageEvent } from "../matrix/events/ImageEvent";

export class PostData {
    public readonly event_id: string;
    public readonly content: ImageEvent;
    constructor(event_id: string, content: ImageEvent) {
        this.event_id = event_id;
        this.content = content;
    }
}
export class UserData {
    public readonly mxid: string;
    public readonly display_name: string;
    public readonly avatar_url: string;

    constructor(mxid: string, display_name: string, avatar_url: string) {
        this.mxid = mxid;
        this.display_name = display_name;
        this.avatar_url = avatar_url;
    }
}
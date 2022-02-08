// This file is based on https://github.com/matrix-org/cerulean/blob/1499ca2b80d3a2cc090f75636b1c4db138729b59/src/Client.js
import { MatrixContents, MatrixEvent } from './event_types';
import Storage from './storage';

export const constMatrixArtServer = process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL || "https://matrix.art.midnightthoughts.space";

export default class MatrixClient {
    private joinedRooms: Map<string, string> = new Map<string, string>(); // room alias -> room ID
    private userProfileCache: Map<string, { displayname?: string; avatar_url?: string; }> = new Map(); // user_id -> {display_name; avatar;}
    private serverUrl?: string;
    private _userId?: string;
    private _accessToken?: string;
    private _isGuest?: boolean;
    private _profileRoomId?: string;
    private serverName?: string;
    get userId(): string | undefined {
        return this._userId;
    }
    get accessToken(): string | undefined {
        return this._accessToken;
    }
    get isGuest(): boolean | undefined {
        return this._isGuest;
    }

    get profileRoomId(): string | undefined {
        return this.joinedRooms.get(`#${this.userId}`) || this._profileRoomId;
    }

    constructor(private storage: Storage) {
        this.serverUrl = this.storage.getItem("serverUrl");
        this._userId = this.storage.getItem("userId");
        this._accessToken = this.storage.getItem("accessToken");
        this._isGuest = this.storage.getItem("isGuest");
        this.serverName = this.storage.getItem("serverName");
        this._profileRoomId = this.storage.getItem("profileRoomId");
    }

    private saveAuthState() {
        if (!this.storage) {
            return;
        }
        this.storage.setOrDelete("serverUrl", this.serverUrl);
        this.storage.setOrDelete("userId", this._userId);
        this.storage.setOrDelete("accessToken", this._accessToken);
        this.storage.setOrDelete("serverName", this.serverName);
        this.storage.setOrDelete("isGuest", this._isGuest);
    }

    private generateToken(len: number) {
        var arr = new Uint8Array(len / 2);
        if (typeof window !== "undefined") {
            window.crypto.getRandomValues(arr);
        } else {
            require("crypto").randomFillSync(arr); // eslint-disable-line unicorn/prefer-module
        }
        /* eslint-disable unicorn/prefer-spread */
        return Array.from(arr, (num) => {
            return num.toString(16).padStart(2, "0");
        }).join("");
        /* eslint-enable unicorn/prefer-spread */
    }

    async registerAsGuest(serverUrl: string) {
        let username = "matrix_art_guest_" + Date.now();
        let password = this.generateToken(32);

        let data;
        if (process.env.NEXT_PUBLIC_ENV !== "test") {
            try {
                data = await this.fetchJson(`${serverUrl}/r0/register?kind=guest`, {
                    method: "POST",
                    body: JSON.stringify({
                        auth: {
                            type: "m.login.dummy",
                        },
                        username: username,
                        password: password,
                    }),
                });
            } catch (error) {
                console.error(`${serverUrl}/r0/register?kind=guest:\n${error}`);
                throw new Error("Failed to register new guest");
            }
        } else {
            data = {
                user_id: "1",
                access_token: "1",
                home_server: "https://blub",
            };
        }
        this.serverUrl = serverUrl;
        this._userId = data.user_id;
        this._accessToken = data.access_token;
        this.serverName = data.home_server;
        this._isGuest = true;
        this.saveAuthState();
        console.log("Registered as guest", username);
    }

    async logout(suppressLogout: boolean) {
        try {
            if (!suppressLogout) {
                await this.fetchJson(`${this.serverUrl}/r0/logout`, {
                    method: "POST",
                    body: "{}",
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                });
            }
        } finally {
            console.log("Removing login credentials");
            this.serverUrl = undefined;
            this._userId = undefined;
            this._accessToken = undefined;
            this._isGuest = undefined;
            this.serverName = undefined;
            this.saveAuthState();
        }
    }

    private async fetchJson(fullUrl: string, fetchParams: any) {
        // Do not execute requests in tests!
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            return;
        }

        const response = await fetch(fullUrl, fetchParams);
        const data = await response.json();
        if (response.status === 429) {
            const retry_after: number = data.retry_after_ms;
            return new Promise((resolve) => {
                setTimeout(() => { resolve(this.fetchJson(fullUrl, fetchParams)); }, retry_after);
            });
        }
        if (response.status !== 200) {
            if (data.errcode === "M_UNKNOWN_TOKEN") {
                console.log("unknown token, logging user out:", data);
                // suppressLogout so we don't recursively call fetchJson
                await this.logout(true);
            }
            throw data;
        }
        return data;
    }

    async login(serverUrl: string, username: any, password: any, saveToStorage: any) {
        const data = await this.fetchJson(`${serverUrl}/r0/login`, {
            method: "POST",
            body: JSON.stringify({
                type: "m.login.password",
                identifier: {
                    type: "m.id.user",
                    user: username,
                },
                password: password,
            }),
        });
        this.serverUrl = serverUrl;
        this._userId = data.user_id;
        this._accessToken = data.access_token;
        this._isGuest = false;
        this.serverName = data.home_server;
        if (saveToStorage) {
            this.saveAuthState();
        }
    }

    async getOpenidToken(): Promise<string> {
        const data = await this.fetchJson(`${this.serverUrl}/r0/user/${this.userId}/openid/request_token`, {
            method: "POST",
            body: "{}",
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        return process.env.NEXT_PUBLIC_ENV !== "test" ? data.access_token : "openid";
    }

    async register(serverUrl: string, username: string, password: string) {
        console.log(`${serverUrl}/r0/register`);
        const data = await this.fetchJson(`${serverUrl}/r0/register`, {
            method: "POST",
            body: JSON.stringify({
                auth: {
                    type: "m.login.dummy",
                },
                username: username,
                password: password,
            }),
        });
        this.serverUrl = serverUrl;
        this._userId = data.user_id;
        this._accessToken = data.access_token;
        this._isGuest = false;
        this.serverName = data.home_server;
        this.saveAuthState();

        // Add user to directory
        await this.fetchJson(`/api/directory`, {
            method: "POST",
            body: JSON.stringify({
                user_id: username,
                user_room: "@" + this.userId,
            }),
        });
    }

    async setDisplayname(newDisplayname: string) {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            if (this.userProfileCache.has(this.userId!)) {
                const old = this.userProfileCache.get(this.userId!)!;
                old.displayname = newDisplayname;
                this.userProfileCache.set(this.userId!, old);
            } else {
                await this.getProfile(this.userId!);
            }
            return;
        }

        await this.fetchJson(
            `${this.serverUrl}/r0/profile/${encodeURIComponent(this.userId!)}/displayname`,
            {
                method: "PUT",
                body: JSON.stringify({ displayname: newDisplayname }),
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        if (this.userProfileCache.has(this.userId!)) {
            const old = this.userProfileCache.get(this.userId!)!;
            old.displayname = newDisplayname;
            this.userProfileCache.set(this.userId!, old);
        } else {
            await this.getProfile(this.userId!);
        }
    }

    async setAvatarUrl(newAvatarUrl: string) {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            if (this.userProfileCache.has(this.userId!)) {
                const old = this.userProfileCache.get(this.userId!)!;
                old.avatar_url = newAvatarUrl;
                this.userProfileCache.set(this.userId!, old);
            } else {
                await this.getProfile(this.userId!);
            }
            return;
        }

        await this.fetchJson(
            `${this.serverUrl}/r0/profile/${encodeURIComponent(this.userId!)}/avatar_url`,
            {
                method: "PUT",
                body: JSON.stringify({ avatar_url: newAvatarUrl }),
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        if (this.userProfileCache.has(this.userId!)) {
            const old = this.userProfileCache.get(this.userId!)!;
            old.avatar_url = newAvatarUrl;
            this.userProfileCache.set(this.userId!, old);
        } else {
            await this.getProfile(this.userId!);
        }
    }

    async getProfile(userId: string): Promise<{ displayname?: string; avatar_url?: string; }> {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            const data = {
                displayname: "Test"
            };
            this.userProfileCache.set(userId, data);
            return data;
        }
        if (this.userProfileCache.has(userId)) {
            console.debug(`Returning cached copy of ${userId}'s profile`);
            return this.userProfileCache.get(userId)!;
        }
        console.debug(`Fetching fresh copy of ${userId}'s profile`);
        const data = await this.fetchJson(
            `${this.serverUrl}/r0/profile/${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        this.userProfileCache.set(userId, data);
        return data;
    }

    /**
     * Join a room by alias. If already joined, no-ops. If joining our own profile room,
     * attempts to create it.
     * @param {string} roomAlias The room alias to join
     * @returns {string} The room ID of the joined room.
     */
    async joinProfileRoom(roomAlias: string): Promise<string> {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            return "!1:blub";
        }
        const roomId = this.joinedRooms.get(roomAlias);
        if (roomId) {
            return roomId;
        }
        const isMyself = roomAlias.slice(1) === this.userId;

        try {
            let data = await this.fetchJson(
                `${this.serverUrl}/r0/join/${encodeURIComponent(roomAlias)}`,
                {
                    method: "POST",
                    body: "{}",
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                }
            );
            if (isMyself) {
                this.storage?.setOrDelete("profileRoomId", data.room_id);
            }
            this.joinedRooms.set(roomAlias, data.room_id);
            return data.room_id;
        } catch (error) {
            // try to make our Profile room
            if (isMyself) {
                let data = await this.fetchJson(
                    `${this.serverUrl}/r0/createRoom`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            preset: "public_chat",
                            name: `${this.userId}'s Profile`,
                            topic: "Matrix Art Profile",
                            room_alias_name: "@" + MatrixClient.localpart(this.userId!),
                            creation_content: {
                                type: "matrixart.profile"
                            },
                            power_level_content_override: {
                                state_default: 100,
                                events_default: 100,
                                kick: 100,
                                invite: 100,
                                ban: 100,
                                redact: 100,
                            },
                            initial_state: [
                                {
                                    type: "m.room.guest_access",
                                    content: {
                                        guest_access: "can_join"
                                    },
                                    state_key: ""
                                }
                            ]
                        }),
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    }
                );
                this.joinedRooms.set(roomAlias, data.room_id);

                this.storage?.setOrDelete("profileRoomId", data.room_id);
                return data.room_id;
            } else {
                throw error;
            }
        }
    }

    private static localpart(userId: string) {
        return userId.split(":")[0].slice(1);
    }

    downloadLink(mxcUri: string): string | undefined {
        if (!mxcUri) {
            return;
        }
        if (mxcUri.indexOf("mxc://") !== 0) {
            return;
        }
        return constMatrixArtServer + "/_matrix/media/r0/download/" + mxcUri.split("mxc://")[1];
    }

    thumbnailLink(mxcUri: string, method: "scale" | "crop", width: number, height: number): string | undefined {
        if (!mxcUri) {
            return;
        }
        if (mxcUri.indexOf("mxc://") !== 0) {
            return;
        }
        return `${constMatrixArtServer}/_matrix/media/r0/thumbnail/${mxcUri.split("mxc://")[1]}?method=${encodeURIComponent(method)}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}`;
    }

    async sendEvent(roomId: string, event_type: string, content: MatrixContents): Promise<string> {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            return "$abcde";
        }
        const txnId = Date.now();
        const data = await this.fetchJson(
            `${this.serverUrl}/r0/rooms/${encodeURIComponent(
                roomId
            )}/send/${event_type}/${encodeURIComponent(txnId)}`,
            {
                method: "PUT",
                body: JSON.stringify(content),
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        return data.event_id;
    }

    async uploadFile(file: File | Blob): Promise<string> {
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            return "mxc://blub/blub";
        }
        const fileName = (file as File).name || Date.now();
        const mediaUrl = this.serverUrl?.slice(0, -1 * "/client".length);
        const res = await fetch(
            `${mediaUrl}/media/r0/upload?filename=${encodeURIComponent(
                fileName
            )}`,
            {
                method: "POST",
                body: file,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
        const data = await res.json();
        if (!res.ok) {
            throw data;
        }
        return data.content_uri;
    }

    /// Timeline for followed rooms
    // getAggregatedTimeline returns all events from all timeline rooms being followed.
    // This is done by calling `/sync` and keeping messages for all rooms that have an #@ alias.
    async getAggregatedTimeline() {
        let info: {
            timeline: any[],
            from: string | undefined;
        } = {
            timeline: [],
            from: undefined,
        };
        if (!this.accessToken) {
            console.error("No access token");
            return info;
        }
        const filterJson = JSON.stringify({
            room: {
                timeline: {
                    limit: 100,
                },
            },
        });
        let syncData = await this.fetchJson(
            `${this.serverUrl}/r0/sync?filter=${filterJson}`,
            {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        // filter only @# rooms then add in all timeline events
        const roomIds = Object.keys(syncData.rooms.join).filter((roomId) => {
            // try to find an #@ alias
            let foundAlias = false;
            for (let ev of syncData.rooms.join[roomId].state.events) {
                if (ev.type === "m.room.aliases" && ev.content.aliases) {
                    for (let alias of ev.content.aliases) {
                        if (alias.startsWith("#@")) {
                            foundAlias = true;
                            break;
                        }
                    }
                }
                if (foundAlias) {
                    break;
                }
            }
            return foundAlias;
        });
        let events = [];
        for (let roomId of roomIds) {
            for (let ev of syncData.rooms.join[roomId].timeline.events) {
                ev.room_id = roomId;
                events.push(ev);
            }
        }
        // sort by origin_server_ts
        info.timeline = events.sort((a, b) => {
            if (a.origin_server_ts === b.origin_server_ts) {
                return 0;
            }
            if (a.origin_server_ts < b.origin_server_ts) {
                return 1;
            }
            return -1;
        });
        info.from = syncData.next_batch;
        return info;
    }

    async getTimeline(roomId: string, limit: number, filter: object = { limit: 30, types: ["m.image", "m.image_gallery"] }): Promise<MatrixEvent[]> {// eslint-disable-line unicorn/no-object-as-default-parameter
        if (process.env.NEXT_PUBLIC_ENV === "test") {
            return [
                {
                    type: "m.image",
                    room_id: '!hxnnsrGMUfcrXPEPZu:art.midnightthoughts.space',
                    event_id: '$QtbB-3JYAEOXJeC-mrZqFIEqon4uBLYVwTSw2SDWrJg',
                    origin_server_ts: 1_643_317_935_965,
                    content: {
                        "m.caption": [
                            {
                                "m.text": "Test2"
                            }
                        ],
                        "m.thumbnail": [
                            {
                                "height": 500,
                                "mimetype": "image/jpeg",
                                "size": 126_199,
                                "url": "mxc://art.midnightthoughts.space/b73141659586a6d690fe2c3edd43776b19f51529",
                                "width": 800
                            }
                        ],
                        'm.file': {
                            mimetype: 'image/png',
                            name: '767-F_xp11 - 2021-04-13 20.23.07.png',
                            size: 2_129_309,
                            url: 'mxc://art.midnightthoughts.space/21a2b8190b756259510617d3c4c662d1e7c82141'
                        },
                        'm.image': { height: 1040, width: 1920 },
                        'm.text': 'Test',
                        'matrixart.description': 'test2',
                        'matrixart.license': 'cc-by-4.0',
                        'matrixart.nsfw': false,
                        'matrixart.tags': ['test', 'test2'],
                        'xyz.amorgan.blurhash': 'LJA0tGWES2oL~pWDayj[.8WBsAbH'
                    },
                    sender: '@test:art.midnightthoughts.space'
                }
            ];
        }
        if (!this.accessToken) {
            console.error("No access token");
            return [];
        }
        limit = limit || 100;
        let seenEvents = 0;
        let from;
        let msgs: MatrixEvent[] = [];
        while (seenEvents < limit) {
            let fromQuery = ``;
            if (from) {
                fromQuery = `&from=${from}`;
            }
            let data = await this.fetchJson(
                `${this.serverUrl}/r0/rooms/${roomId}/messages?dir=b&limit=${limit}${fromQuery}&filter=${JSON.stringify(filter)}`,
                {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                }
            );
            from = data.end;
            for (const ev of data.chunk) {
                msgs.push(ev);
            }
            seenEvents += msgs.length;
            if (data.chunk.length < limit) {
                break;
            }
            seenEvents += 1; // just in case, to stop infinite loops
        }
        return msgs;
    }

    /**
     * Follow a user by subscribing to their room.
     * @param {string} userId
     */
    async followUser(userId: string) {
        return await this.joinProfileRoom(userId);
    }
}
// This file is based on https://github.com/matrix-org/cerulean/blob/1499ca2b80d3a2cc090f75636b1c4db138729b59/src/Client.js
import { MatrixContents, MatrixEvent } from './event_types';
import Storage from './storage';

export const constMatrixArtServer = process.env.NEXT_PUBLIC_DEFAULT_SERVER_URL || "https://matrix.art.midnightthoughts.space";

export default class MatrixClient {
    private joinedRooms: Map<string, string>;
    private userProfileCache: Map<string, any>;
    private storage!: Storage;
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
        console.log(this.joinedRooms);
        console.log(this._profileRoomId);
        return this.joinedRooms.get(`#${this.userId}`) || this._profileRoomId;
    }

    constructor(storage: Storage) {
        this.joinedRooms = new Map(); // room alias -> room ID
        this.userProfileCache = new Map(); // user_id -> {display_name; avatar;}
        if (!storage) {
            return;
        }
        this.storage = storage;
        this.serverUrl = storage.getItem("serverUrl");
        this._userId = storage.getItem("userId");
        this._accessToken = storage.getItem("accessToken");
        this._isGuest = (this.userId || "").indexOf("@matrix_art_guest_") === 0;
        this.serverName = storage.getItem("serverName");
        this._profileRoomId = storage.getItem("profileRoomId");
    }

    private saveAuthState() {
        if (!this.storage) {
            return;
        }
        this.storage.setOrDelete("serverUrl", this.serverUrl);
        this.storage.setOrDelete("userId", this.userId);
        this.storage.setOrDelete("accessToken", this.accessToken);
        this.storage.setOrDelete("serverName", this.serverName);
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

        const data = await this.fetchJson(`${serverUrl}/r0/register?kind=guest`, {
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
        const response = await fetch(fullUrl, fetchParams);
        const data = await response.json();
        if (!response.ok) {
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
        return data.access_token;
    }

    async register(serverUrl: string, username: string, password: string) {
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
        await this.fetchJson(
            `${this.serverUrl}/r0/profile/${encodeURIComponent(this.userId!)}/displayname`,
            {
                method: "PUT",
                body: JSON.stringify({ displayname: newDisplayname }),
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        if (this.userProfileCache.has(this.userId!)) {
            const old = this.userProfileCache.get(this.userId!);
            old.displayname = newDisplayname;
            this.userProfileCache.set(this.userId!, old);
        } else {
            await this.getProfile(this.userId!);
        }
    }

    async setAvatarUrl(newAvatarUrl: string) {
        await this.fetchJson(
            `${this.serverUrl}/r0/profile/${encodeURIComponent(this.userId!)}/avatar_url`,
            {
                method: "PUT",
                body: JSON.stringify({ avatar_url: newAvatarUrl }),
                headers: { Authorization: `Bearer ${this.accessToken}` },
            }
        );
        if (this.userProfileCache.has(this.userId!)) {
            const old = this.userProfileCache.get(this.userId!);
            old.avatar_url = newAvatarUrl;
            this.userProfileCache.set(this.userId!, old);
        } else {
            await this.getProfile(this.userId!);
        }
    }

    async getProfile(userId: string) {
        if (this.userProfileCache.has(userId)) {
            console.debug(`Returning cached copy of ${userId}'s profile`);
            return this.userProfileCache.get(userId);
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
    async joinProfileRoom(roomAlias: string) {
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
                this.storage.setOrDelete("profileRoomId", data.room_id);
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
                            }
                        }),
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    }
                );
                this.joinedRooms.set(roomAlias, data.room_id);

                this.storage.setOrDelete("profileRoomId", data.room_id);
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

    async getTimeline(roomId: string, limit: number, filter: object = { limit: 30, types: ["m.image", "m.image_gallery"] }) {// eslint-disable-line unicorn/no-object-as-default-parameter
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
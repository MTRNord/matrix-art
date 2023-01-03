import {
    createClient,
    EventTimeline,
    EventType,
    IndexedDBCryptoStore,
    IndexedDBStore,
    MatrixClient as MatrixClientSdk,
    MatrixEvent, MatrixEventEvent,
    Preset,
    RoomCreateTypeField,
    RoomType,
    UNSTABLE_MSC3088_ENABLED,
    UNSTABLE_MSC3088_PURPOSE,
    UNSTABLE_MSC3089_TREE_SUBTYPE
} from 'matrix-js-sdk';
import {
    MEGOLM_ALGORITHM
} from 'matrix-js-sdk/lib/crypto/olmlib';
import {
    DEFAULT_TREE_POWER_LEVELS_TEMPLATE,
    MSC3089TreeSpace
} from 'matrix-js-sdk/lib/models/MSC3089TreeSpace';
import {
    M_IMAGE
} from './events/ImageEvent';
// @ts-ignore - `.ts` is needed here to make TS happy
import IndexedDBWorker from "./workers/indexeddb.worker.ts?worker";

export class MatrixClient {
    private events: MatrixEvent[] = [];
    private currentUserDirectory?: MSC3089TreeSpace;
    private rootDirectory?: MSC3089TreeSpace;
    private constructor(private client: MatrixClientSdk) { }

    public static async new(): Promise<MatrixClient> {
        // @ts-ignore Known to be a thing
        if (!global.Olm) {
            console.error(
                "global.Olm does not seem to be present."
                + " Did you forget to add olm in the out directory?"
            );
        }

        let server;
        if (window.localStorage.getItem("server") !== null) {
            server = window.localStorage.getItem("server");
        } else {
            server = import.meta.env.VITE_MATRIX_SERVER_URL;
        }


        // TODO user id and token if logged in instead of new guest all the time
        if (!server) {
            throw new Error("No matrix server URL defined");
        }

        let guest_client;
        if (window.localStorage.getItem("mxid_guest") !== null) {
            const mxid = window.localStorage.getItem("mxid_guest") ?? undefined;
            const token = window.localStorage.getItem("access_token_guest") ?? undefined;
            const device_id = window.localStorage.getItem("device_id_guest") ?? undefined;

            guest_client = createClient({
                useAuthorizationHeader: true,
                baseUrl: server,
                userId: mxid,
                accessToken: token,
                deviceId: device_id,
                // @ts-ignore - The function currently comes with incorrect types
                store: new IndexedDBStore({
                    indexedDB: window.indexedDB,
                    dbName: "matrix-art-sync:guest",
                    localStorage: window.localStorage,
                    workerFactory: () => new IndexedDBWorker(),
                }),
                cryptoStore: new IndexedDBCryptoStore(
                    window.indexedDB, "matrix-art:crypto",
                ),
            });
            guest_client.setGuest(true);
        } {

            const tmpClient = createClient({ baseUrl: import.meta.env.VITE_MATRIX_SERVER_URL });
            // @ts-ignore - The function currently comes with incorrect types
            const { user_id, device_id, access_token } = await tmpClient.registerGuest();

            guest_client = createClient({
                useAuthorizationHeader: true,
                baseUrl: server,
                userId: user_id,
                accessToken: access_token,
                deviceId: device_id,
                // @ts-ignore - The function currently comes with incorrect types
                store: new IndexedDBStore({
                    indexedDB: window.indexedDB,
                    dbName: "matrix-art-sync:guest",
                    localStorage: window.localStorage,
                    workerFactory: () => new IndexedDBWorker(),
                }),
                cryptoStore: new IndexedDBCryptoStore(
                    window.indexedDB, "matrix-art:crypto",
                ),
            });
            guest_client.setGuest(true);
            window.localStorage.setItem("mxid_guest", user_id);
            window.localStorage.setItem("access_token_guest", access_token);
            window.localStorage.setItem("device_id_guest", device_id);
            window.localStorage.setItem("server", server);
        }

        let client;
        if (window.localStorage.getItem("mxid") !== null) {
            const mxid = window.localStorage.getItem("mxid") ?? undefined;
            const token = window.localStorage.getItem("access_token") ?? undefined;
            const device_id = window.localStorage.getItem("device_id") ?? undefined;

            client = createClient({
                useAuthorizationHeader: true,
                baseUrl: server,
                userId: mxid,
                accessToken: token,
                deviceId: device_id,
                // @ts-ignore - The function currently comes with incorrect types
                store: new IndexedDBStore({
                    indexedDB: window.indexedDB,
                    dbName: "matrix-art-sync:guest",
                    localStorage: window.localStorage,
                    workerFactory: () => new IndexedDBWorker(),
                }),
                cryptoStore: new IndexedDBCryptoStore(
                    window.indexedDB, "matrix-art:crypto",
                ),
            });
            client.setGuest(false);
        }

        return new MatrixClient(client ?? guest_client);
    }

    public isLoggedIn(): boolean {
        return this.client.isLoggedIn() && !this.client.isGuest();
    }

    public async start(): Promise<void> {
        //TODO Setup handlers
        this.client.on(MatrixEventEvent.Decrypted, (event: MatrixEvent, err?: Error) => {
            const ext_ev = event.unstableExtensibleEvent;
            if (ext_ev?.isEquivalentTo(M_IMAGE)) {
                this.events.push(event);
            }
        });

        console.log("start");
        await this.client.store.startup();
        await this.client.initCrypto();
        await this.client.startClient();

        // Load the root
        const room = await this.client.joinRoom(import.meta.env.VITE_MATRIX_ROOT_FOLDER);
        // FIXME: This will break if the server is slower
        await delay(1000);
        this.rootDirectory = new MSC3089TreeSpace(this.client, room.roomId);
        console.log("started");
    }

    public async register(homeserver: string = import.meta.env.VITE_MATRIX_SERVER_URL, username: string, password: string, createProfile: boolean = false) {
        this.client.stopClient();
        this.client = createClient({
            useAuthorizationHeader: true,
            baseUrl: homeserver,
            userId: username,
            deviceId: "Matrix Art",
            // @ts-ignore - The function currently comes with incorrect types
            store: new IndexedDBStore({
                indexedDB: window.indexedDB,
                dbName: "matrix-art-sync:loggedin",
                localStorage: window.localStorage,
                workerFactory: () => new IndexedDBWorker(),
            }),
            cryptoStore: new IndexedDBCryptoStore(
                window.indexedDB, "matrix-art:crypto",
            ),
        });

        await this.client.register(username, password, null, { type: "m.login.dummy" });

        window.localStorage.setItem("server", homeserver);
        window.localStorage.setItem("mxid", username);
        window.localStorage.setItem("access_token", this.client.getAccessToken() ?? "unknown");
        window.localStorage.setItem("device_id", "Matrix Art");
        await this.start();
        if (createProfile) {
            const subdirs = this.rootDirectory?.getDirectories();
            const id = this.client.getUserId()?.replace(":", "_");
            if (subdirs?.some((directory) => directory.room.name === id)) {
                this.rootDirectory = subdirs?.find((directory) => directory.room.name === id);
            } else {
                await this.createProfileFolder();
            }
        }
    }

    // Login and create the profile if wanted
    public async login(homeserver: string, username: string, password: string, createProfile: boolean = false): Promise<void> {
        this.client.stopClient();
        this.client = createClient({
            useAuthorizationHeader: true,
            baseUrl: homeserver,
            userId: username,
            deviceId: "Matrix Art",
            // @ts-ignore - The function currently comes with incorrect types
            store: new IndexedDBStore({
                indexedDB: window.indexedDB,
                dbName: "matrix-art-sync:loggedin",
                localStorage: window.localStorage,
                workerFactory: () => new IndexedDBWorker(),
            }),
            cryptoStore: new IndexedDBCryptoStore(
                window.indexedDB, "matrix-art:crypto",
            ),
        });
        await this.client.loginWithPassword(username, password);

        window.localStorage.setItem("server", homeserver);
        window.localStorage.setItem("mxid", username);
        window.localStorage.setItem("access_token", this.client.getAccessToken() ?? "unknown");
        window.localStorage.setItem("device_id", "Matrix Art");
        await this.start();
        if (createProfile) {
            const subdirs = this.rootDirectory?.getDirectories();
            console.log(subdirs);
            const id = this.client.getUserId()?.replace(":", "_");
            if (subdirs?.some((directory) => directory.room.name === id)) {
                this.rootDirectory = subdirs?.find((directory) => directory.room.name === id);
            } else {
                await this.createProfileFolder();
            }
        }
    }

    // creates the profile
    private async createProfileFolder() {
        if (this.client.isGuest()) {
            throw new Error("Cannot create a file tree space as a guest");
        }
        // Load the root as client changed
        const room = await this.client.joinRoom(import.meta.env.VITE_MATRIX_ROOT_FOLDER);
        await delay(1000);
        this.rootDirectory = new MSC3089TreeSpace(this.client, room.roomId);
        // Create the user folder and add it to the top folder
        const id = this.client.getUserId()?.replace(":", "_");
        this.currentUserDirectory = await this.createPublicSubDirectory(this.rootDirectory, id ?? "unknown");
        // Create the public timeline for the user. We dont need it saved as we can get it again later using the users dir.
        await this.createPublicSubDirectory(this.currentUserDirectory, "Timeline");
    }

    /**
     * Creates a new file tree space with the given name. The client will pick
     * defaults for how it expects to be able to support the remaining API offered
     * by the returned class.
     *
     * Note that this is UNSTABLE and may have breaking changes without notice.
     * @param {string} name The name of the tree space.
     * @returns {Promise<MSC3089TreeSpace>} Resolves to the created space.
     * 
     * This is taken from https://github.com/matrix-org/matrix-js-sdk/blob/d6f1c6cfdc5a4f3d7b4ec67fe9f4d89d7319d8f7/src/client.ts#L8776
     * License of the original file: Apache-2.0
     */
    public async createPublicFileTree(name: string): Promise<MSC3089TreeSpace> {
        if (this.client.isGuest()) {
            throw new Error("Cannot create a file tree space as a guest");
        }
        const { room_id: roomId } = await this.client.createRoom({
            name: name,
            preset: Preset.PublicChat,
            power_level_content_override: {
                ...DEFAULT_TREE_POWER_LEVELS_TEMPLATE,
                users: {
                    // We want to be able to moderate this as the instance admin for legal reasons
                    [import.meta.env.VITE_MATRIX_INSTANCE_ADMIN]: 100,
                    // We initially need to use 100 to be able to create the room...
                    [this.client.getUserId() ?? "broken"]: 100,
                },
            },
            invite: [
                import.meta.env.VITE_MATRIX_INSTANCE_ADMIN,
            ],
            creation_content: {
                [RoomCreateTypeField]: RoomType.Space,
            },
            initial_state: [
                {
                    type: UNSTABLE_MSC3088_PURPOSE.name,
                    state_key: UNSTABLE_MSC3089_TREE_SUBTYPE.name,
                    content: {
                        [UNSTABLE_MSC3088_ENABLED.name]: true,
                    },
                },
                {
                    type: EventType.RoomEncryption,
                    state_key: "",
                    content: {
                        algorithm: MEGOLM_ALGORITHM,
                    },
                },
                {
                    type: EventType.RoomGuestAccess,
                    state_key: "",
                    content: {
                        guest_access: "can_join",
                    },
                },
                {
                    type: EventType.RoomHistoryVisibility,
                    state_key: "",
                    content: {
                        history_visibility: "world_readable",
                    },
                }
            ],
        });
        // Demote ourself
        const room = this.client.getRoom(roomId);
        const powerLevelEvent = room?.getLiveTimeline().getState(EventTimeline.FORWARDS)?.getStateEvents(EventType.RoomPowerLevels, "");
        if (!powerLevelEvent) {
            throw new Error("Failed to find PL event");
        }
        await this.client.setPowerLevel(roomId, this.client.getUserId() ?? "unknown", 50, powerLevelEvent);
        return new MSC3089TreeSpace(this.client, roomId);
    }

    /**
     * Creates a directory under this tree space, represented as another tree space.
     * @param {string} name The name for the directory.
     * @returns {Promise<MSC3089TreeSpace>} Resolves to the created directory.
     * 
     * This is taken from https://github.com/matrix-org/matrix-js-sdk/blob/feb83ba161c32c0519613b88027f573e22efa3aa/src/models/MSC3089TreeSpace.ts#L226
     * License of the original file: Apache-2.0
     */
    public async createPublicSubDirectory(topdirectory: MSC3089TreeSpace, name: string): Promise<MSC3089TreeSpace> {
        const directory = await this.createPublicFileTree(name);

        await this.client.sendStateEvent(topdirectory.roomId, EventType.SpaceChild, {
            via: [this.client.getDomain()],
        }, directory.roomId);

        await this.client.sendStateEvent(directory.roomId, EventType.SpaceParent, {
            via: [this.client.getDomain()],
        }, topdirectory.roomId);

        return directory;
    }
}

/* Technical folder layout (https://github.com/matrix-org/matrix-spec-proposals/blob/travis/msc/trees/proposals/3089-file-tree-structures.md)
Idea by TravisR

Note that every user can create a user folder or delete themself from it again.
Every user owns their own user folder.

If possible users shall never remove relations to other users folders.

+ 📂 Matrix Art User Dir (public, m.space)
    + 📂 User A (public, m.space)
        + 📂 Timeline (m.space)
            - 📄 Image A
            = Room A (invite protected, <no type>)
                - 📄 Image B (counted as under the timeline)
    + 📂 User B (public, m.space)
        + 📂 Timeline (m.space)
            - 📄 Image C
            = Room B (invite protected, <no type>)
                - 📄 Image D (counted as under the timeline)
*/

function delay(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
}
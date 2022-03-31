import { createClient, IndexedDBCryptoStore, IndexedDBStore, MatrixClient as MatrixClientSdk, MatrixEvent, MatrixEventEvent, PREFIX_MEDIA_R0 } from 'matrix-js-sdk';
import { M_IMAGE } from './events/ImageEvent';
// @ts-ignore - `.ts` is needed here to make TS happy
import IndexedDBWorker from "./workers/indexeddb.worker.ts?worker";

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' };

export class MatrixClient {
    private constructor(private client: MatrixClientSdk) { }

    public static async new(): Promise<MatrixClient> {
        // @ts-ignore Known to be a thing
        if (!global.Olm) {
            console.error(
                "global.Olm does not seem to be present."
                + " Did you forget to add olm in the out directory?"
            );
        }


        // TODO user id and token if logged in instead of new guest all the time
        console.log(import.meta.env.VITE_MATRIX_SERVER_URL);
        if (!import.meta.env.VITE_MATRIX_SERVER_URL) {
            throw new Error("No matrix server URL defined");
        }
        const tmpClient = createClient(import.meta.env.VITE_MATRIX_SERVER_URL);
        // @ts-ignore - The function currently comes with incorrect types
        const { user_id, device_id, access_token } = await tmpClient.registerGuest();

        const client = createClient({
            useAuthorizationHeader: true,
            baseUrl: import.meta.env.VITE_MATRIX_SERVER_URL,
            userId: user_id,
            accessToken: access_token,
            deviceId: device_id,
            sessionStore: new IndexedDBStore({
                indexedDB: window.indexedDB,
                dbName: "matrix-art-sync",
                localStorage: window.localStorage,
                workerFactory: () => new IndexedDBWorker(),
            }),
            cryptoStore: new IndexedDBCryptoStore(
                window.indexedDB, "matrix-art:crypto",
            ),
        });
        client.setGuest(true);
        return new MatrixClient(client);
    }

    public async start(): Promise<void> {
        //TODO Setup handlers
        const onDecryptedMessage = (message: MatrixEvent) => {
            console.log('Got encrypted message: ', message);
        };
        this.client.on(MatrixEventEvent.Decrypted, (event: MatrixEvent) => {
            const ext_ev = event.unstableExtensibleEvent;
            if (ext_ev?.isEquivalentTo(M_IMAGE)) {
                onDecryptedMessage(event);
            }
        });

        console.log("start");
        await this.client.initCrypto();
        await this.client.startClient();
        console.log("started");
    }
}
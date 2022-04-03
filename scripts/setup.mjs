import Olm from '@matrix-org/olm';
global.Olm = Olm;

import inquirer from 'inquirer';
import {
    MemoryCryptoStore,
    MemoryStore,
    createClient,
    Preset,
    EventType,
    RoomCreateTypeField,
    RoomType,
    UNSTABLE_MSC3088_PURPOSE,
    UNSTABLE_MSC3089_TREE_SUBTYPE,
    UNSTABLE_MSC3088_ENABLED
} from 'matrix-js-sdk';
import { MEGOLM_ALGORITHM } from 'matrix-js-sdk/lib/crypto/olmlib.js';
import { DEFAULT_TREE_POWER_LEVELS_TEMPLATE } from 'matrix-js-sdk/lib/models/MSC3089TreeSpace.js';
import { AutoDiscovery } from 'matrix-js-sdk/lib/autodiscovery.js';
import fs from 'fs';

console.info(`Welcome to setting up your Matrix Art instance.
This will generate the required things for your instance.
It will generate the room directory and the config file.
You will need a user account that is the admin of your instance. We recommend to use a mjolnir.
You will need to provide the following information:`);
const replies = await inquirer.prompt([
    {
        type: 'input',
        name: 'instance_name',
        message: 'What is the instance Name?',
        default: "Matrix Art",
    },
    {
        type: 'input',
        name: 'homeserver',
        message: 'What is the instance Homeserver?',
        default: undefined,
    },
    {
        type: 'input',
        name: 'admin_user',
        message: 'What is the admin user\'s full MXID?',
        default: undefined,
    },
    {
        type: 'password',
        name: 'admin_password',
        message: 'What is the admin user\'s password? (not going to be stored)',
        default: undefined,
    },
]);

// Check inputs
console.info("Checking inputs...");
if (replies.homeserver === undefined || replies.admin_user === undefined || replies.admin_password === undefined || replies.instance_name === undefined) {
    console.error('Please fill in all fields');
    process.exit(1);
}
if (replies.homeserver.lastIndexOf('https://', 0) !== 0 && replies.homeserver.lastIndexOf('http://', 0) !== 0) {
    console.error('Please enter a valid homeserver url');
    process.exit(1);
}
if (replies.admin_user.lastIndexOf('@', 0) !== 0) {
    console.error('Please enter a valid admin user');
    process.exit(1);
}

await Olm.init();

// Matrix stuff
console.info("Connecting to homeserver...");
const client = createClient({
    useAuthorizationHeader: true,
    baseUrl: replies.homeserver,
    userId: replies.admin_user,
    deviceId: "MatrixArtSetup",
    sessionStore: new MemoryStore(),
    cryptoStore: new MemoryCryptoStore()
});

await client.loginWithPassword(replies.admin_user, replies.admin_password);
await client.initCrypto();
await client.startClient();

// Create room
console.info("Creating root room...");
await client.createRoom({
    name: replies.instance_name,
    preset: Preset.PublicChat,
    power_level_content_override: {
        ...DEFAULT_TREE_POWER_LEVELS_TEMPLATE,
        events: {
            [EventType.SpaceChild]: 0,
        },
        users: {
            [client.getUserId()]: 100,
        },
    },
    creation_content: {
        [RoomCreateTypeField]: RoomType.Space,
    },
    room_alias_name: replies.instance_name.replace(" ", "_"),
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

const wellKnown = await AutoDiscovery.getRawClientConfig(replies.homeserver);

// Write config
console.info("Writing config...");
fs.writeFileSync('./.env.local', `VITE_MATRIX_SERVER_URL="${replies.homeserver}"
VITE_MATRIX_INSTANCE_ADMIN="${replies.admin_user}"
VITE_MATRIX_ROOT_FOLDER="#${replies.instance_name.replace(" ", "_")}:${wellKnown['m.homeserver']}")}"`);

console.info("Your instance is ready! Have fun!");
process.exit(0);

//TODO: Allow upgrading the room with this script if the matrix art requirements change
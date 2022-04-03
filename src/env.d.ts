/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MATRIX_SERVER_URL: string;
    readonly VITE_MATRIX_ROOT_FOLDER: string;
    readonly VITE_MATRIX_INSTANCE_ADMIN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Game server base URL, e.g. http://localhost:3000 (see src/utils/server.ts). */
    readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

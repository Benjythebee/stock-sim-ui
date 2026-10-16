/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Game server base URL, e.g. http://localhost:3000 (see src/utils/server.ts). */
    readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/** package.json version, injected by vite.config.ts. */
declare const __APP_VERSION__: string;
/** Short git commit the app was built from ("dev" without git), injected by vite.config.ts. */
declare const __APP_REVISION__: string;

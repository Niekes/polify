/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_DESCRIPTION: string;
    // where the app is served, ending in a slash; .env.production and .env.development set it
    readonly VITE_APP_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

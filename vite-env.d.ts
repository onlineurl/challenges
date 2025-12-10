// Manual type definitions to replace missing vite/client
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_USE_MOCK_DATA: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const DefaultHost = 'https://developer.api.autodesk.com';

export type AuthOptions = { access_token: string } | { client_id: string, client_secret: string };

export interface IClientOptions {
    region: Region;
    host: string;
}

export enum Region {
    US = 'us',
    EMEA = 'emea'
}

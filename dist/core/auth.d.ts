import ky from "ky";
import Emittery from "emittery";
export default class Auth {
    #private;
    cache: boolean;
    emitter: Emittery;
    private baseUrl;
    constructor(http: typeof ky, baseUrl?: string, emitter?: Emittery);
    Login(usernameOrEmail: string, password: string): Promise<any>;
    isValidEmail(email: string): void;
    Register(credentials: {
        username: string;
        password: string;
        email: string;
    }): Promise<any>;
    Logout(): Promise<unknown>;
    Update(userInfo: any): Promise<unknown>;
    Me(svelteStore?: boolean): import("svelte/store").Writable<{}>;
    Authenticate(): Promise<any>;
}
//# sourceMappingURL=auth.d.ts.map
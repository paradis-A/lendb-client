import ky from "ky";
import Emittery from "emittery";
export default class Auth {
    #private;
    emitter: Emittery;
    private baseUrl;
    constructor(http: typeof ky, baseUrl?: string, emitter?: Emittery);
    Login(usernameOrEmail: string, password: string): Promise<any>;
    on(event: "logout" | "login" | "update", callback: () => void): void;
    isValidEmail(email: string): void;
    Register(credentials: {
        username: string;
        password: string;
        email: string;
    }): Promise<any>;
    Logout(): Promise<unknown>;
    Update(userInfo: any): Promise<unknown>;
    Me(): any;
    Authenticate(): Promise<any>;
}
//# sourceMappingURL=auth.d.ts.map
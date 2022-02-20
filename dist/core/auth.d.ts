import Emittery from "emittery";
import { AxiosInstance } from "axios/dist/axios.min.js";
export default class Auth {
    #private;
    emitter: Emittery;
    private baseUrl;
    constructor(http: AxiosInstance, baseUrl?: string, emitter?: Emittery);
    Login(usernameOrEmail: string, password: string): Promise<any>;
    on(event: "logout" | "login" | "update", callback: () => void): void;
    isValidEmail(email: string): void;
    Register(credentials: {
        username: string;
        password: string;
        email: string;
    }): Promise<any>;
    Logout(): Promise<any>;
    Update(userInfo: any): Promise<any>;
    Me(): any;
    Authenticate(): Promise<any>;
}

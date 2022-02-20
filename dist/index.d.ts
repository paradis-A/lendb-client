import Object from "./core/object";
import Query from "./core/query";
import Auth from "./core/auth";
import { AxiosInstance } from "axios/dist/axios.min.js";
export default class LenDB {
    #private;
    readonly Auth: Auth;
    readonly http: AxiosInstance;
    readonly wsURL: string;
    private baseURL;
    constructor(host?: string, port?: number, secure?: boolean);
    Object<T>(ref: string, keyOrSingular?: string | boolean): Object;
    Commit(data: Object[]): Promise<any>;
    Query<T>(ref: string): Query<T>;
}

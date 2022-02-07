import Object from "./core/object";
import Query from "./core/query";
import Auth from "./core/auth";
import ky from "ky";
import LenFile from "./core/file";
export default class LenDB {
    #private;
    readonly Auth: Auth;
    readonly http: typeof ky;
    readonly wsURL: string;
    private baseURL;
    constructor(host?: string, port?: number, secure?: boolean);
    Object<T>(ref: string, keyOrSingular?: string | boolean): Object;
    Commit(data: Object[]): Promise<unknown>;
    File(file: File): LenFile;
    Query<T>(ref: string): Query<T>;
}
//# sourceMappingURL=index.d.ts.map
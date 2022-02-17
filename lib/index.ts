import Object from "./core/object";
import Query from "./core/query";
import Auth from "./core/auth";
import ky from "ky"
import LenFile from "./core/file";
import Commit from "./core/commit"
import Emittery from "emittery";
export default class LenDB {
    readonly Auth: Auth;
    readonly http: typeof ky
    readonly wsURL: string
    private baseURL: string
    readonly #Emitter: Emittery
    //if has client id but no cache then
    //if has client_id but invalid
    constructor(
        host: string = "localhost",
        port: number = 5757,
        secure = false
    ) {
        this.baseURL = (secure ? "https://" : "http://") + host + ":" + port
        this.wsURL = (secure ? "wss://" : "ws://") + host + ":" + port
        this.http = ky.create({credentials: "include",prefixUrl: this.baseURL })
        this.#Emitter = new Emittery()
        this.Auth = new Auth(this.http,this.baseURL,this.#Emitter);
    }
    
    Object<T>(ref: string, keyOrSingular?: string | boolean): Object {
        function IdentifiableSubclass<Tbase extends Base>(SuperClass: Constructor<Tbase>) {
            class C extends (<Constructor<Base>>SuperClass) {
            }
            return <Constructor<T & Tbase>>C;
        }
        const ObjectWrapper = IdentifiableSubclass(Object)
        return new ObjectWrapper(ref,keyOrSingular,this.http,this.#Emitter)
    }
    
    Commit(data: Object[]){
        return Commit(data,this.http)
    }

    File(file: File) {
        return new LenFile(file,this.baseURL,this.http,this.#Emitter);
    }
    Query<T>(ref: string) {
        return new Query<T>(ref,this.http,this.wsURL,this.#Emitter);
    }
}

interface Constructor<T> {
    new (...args): T;
}

interface Base {
}
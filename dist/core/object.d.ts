import { AxiosInstance } from "axios/dist/axios.min.js";
import Emittery from "emittery";
export default class LenObject {
    private _http;
    protected _key: string;
    protected _operation: "save" | "load" | "destroy";
    protected _children: LenObject[];
    protected _path: string;
    protected _parentKey: string;
    protected _oldData: {};
    protected _exists: any;
    private _emitter;
    constructor(path: string, key?: string, http?: AxiosInstance, emitter?: Emittery);
    get key(): string;
    set key(value: string);
    destroy(): Promise<any>;
    protected _createWS(): void;
    on(ev: "update" | "destroy"): void;
    onChild(child: string, ev: "add" | "update" | "destroy"): void;
    listen(): void;
    protected _isUpdated(): void;
    getOperation(): "save" | "load" | "destroy";
    getPath(): string;
    parse(): ObjectPayload[];
    new(): LenObject;
    commit(): Promise<any>;
    protected stripNonData(clone: this): this;
    /**
     * Loads the data from the database with key provided
     * through constructor.
     * Will return null if object do not exist,
     */
    load(settings: {
        includeChildren?: boolean;
        include?: string[];
        exclude?: string[];
    }): Promise<any>;
    assign(data: any): this;
    child(path: string, key: string): LenObject;
    /**
     * Mark this Object to be destroyed on calling commit() or commitMany().
     */
    toDestroy(yes?: boolean): this;
}
export interface ObjectPayload {
    data: any;
    key: string;
    operation: "destroy" | "save" | "load";
    path: string;
    singular: boolean;
}

import cuid from "cuid";
import cloneDeep from "lodash/cloneDeep";
import flattenDepth from "lodash/flattenDepth";
import { AxiosInstance } from "axios/dist/axios.min.js";
import Normalize from "./normalize";
import Emittery from "emittery";
import { Writable } from "svelte/store";

export default class LenObject {
    private _http: AxiosInstance;
    protected _key: string;
    protected _operation: "save" | "load" | "destroy";
    protected _children: LenObject[] = [];
    protected _path: string;
    protected _parentKey: string;
    protected _oldData = {};
    protected _exists = undefined;
    private _emitter: Emittery;
    constructor(path: string, key?: string, http?: AxiosInstance, emitter?: Emittery) {
        this._operation = "save";
        if (typeof key == "string" && !cuid.isCuid(key)) {
            throw Error("Invalid key");
        } else if (typeof key == "undefined" || key == null) {
            this.key = cuid();
        } else {
            this.key = key;
        }
        this._http = http;
        this._emitter = emitter;
        this._path = path;
    }

    public get key(): string {
        return this._key;
    }

    public set key(value: string) {
        if (!cuid.isCuid(value)) {
            throw Error("Invalid key");
        }
        if (this._children.length) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i]._parentKey = value;
            }
        }
        this._key = value;
    }

    async destroy() {
        try {
            let payload: any = { key: this._key, ref: this._path, operation: "destroy" };
            let res = (await this._http.post("lenDB", JSON.stringify(payload))).data;
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    protected _createWS() {}

    on(ev: "update" | "destroy") {}

    onChild(child: string, ev: "add" | "update" | "destroy") {}

    listen() {}

    protected _isUpdated() {}

    getOperation(): "save" | "load" | "destroy" {
        return this._operation;
    }

    getPath() {
        return this._path;
    }

    parse(): ObjectPayload[] {
        try {
            let parsed: any[] = [];
            if (this._path.includes("*")) {
                throw Error("Error: Adding or Updating must not contain wildcard path.");
            }
            //@ts-ignore
            let temp: ObjectPayload = {};
            temp.key = this._key;
            temp.operation = this._operation;
            temp.singular = false;
            temp.path = this._path;
            if (this._operation == "save") {
                temp.data = this.stripNonData(Object.assign({}, this));
                temp.key = this._key;
                if (this._children.length) {
                    parsed = flattenDepth([temp, ...this._children.map((c) => c.parse())], 1);
                } else {
                    parsed = [temp];
                }
            } else if (this._operation == "destroy") {
                temp.key = this._key;
                parsed = [temp];
            }
            return [...parsed];
        } catch (error) {
            throw new Error(error);
        }
    }

    new() {
        return new LenObject(this._path, null, this._http, this._emitter);
    }

    async commit(): Promise<any> {
        try {
            let payloads = this.parse();
            let payload: ObjectPayload;
            // console.log(payload)
            // return payload
            if (Array.isArray(payloads) && payloads.length == 1) {
                payload = payloads[0];
            }

            let res = (await this._http.post("lenDB", JSON.stringify(payload || payloads))).data;
            if (this._operation == "destroy") {
                this.new();
            }
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    protected stripNonData(clone: this) {
        delete clone._emitter;
        delete clone._oldData;
        delete clone._children;
        delete clone._key;
        delete clone._http;
        delete clone._isUpdated;
        delete clone._operation;
        delete clone._parentKey;
        delete clone._path;
        return clone;
    }

    /**
     * Loads the data from the database with key provided
     * through constructor.
     * Will return null if object do not exist,
     */
    async load(settings: {includeChildren?: boolean, include?: string[]; exclude?: string[] }): Promise<any> {
        try {
            let payload: any = { operation: "load", key: this._key, ref: this._path };
            let res = (await this._http.post("lenDB", JSON.stringify(payload))).data;
            console.log("load result", res);
            if (res) {
                return Promise.resolve(Normalize(res));
            } else {
                return Promise.resolve({ key: this._key });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    assign(data: any): this {
        let temp = cloneDeep(data);
        delete temp.childProps;
        delete temp.eventHandles;
        delete temp.loadedRawData;
        delete temp.ref;
        delete temp.serializer;
        delete temp.key;
        Object.assign(this, temp);
        return this;
    }



    child(path: string, key: string) {
        let combinedPath = this._path + "/" + this._key + "/" + path;
        if (cuid.isCuid(key)) {
            const existingIndex = this._children.findIndex((c) => c.getPath() == combinedPath && c._key == key);
            if (existingIndex > -1) {
                return this._children[existingIndex];
            }
        }
        this._children.push(new LenObject(combinedPath, key, this._http, this._emitter));
        return this._children[this._children.length - 1];
    }

    /**
     * Mark this Object to be destroyed on calling commit() or commitMany().
     */
    toDestroy(yes = true) {
        this._operation = yes ? "destroy" : "save";
        return this;
    }
}

export interface ObjectPayload {
    data: any;
    key: string;
    operation: "destroy" | "save" | "load";
    path: string;
    singular: boolean;
}

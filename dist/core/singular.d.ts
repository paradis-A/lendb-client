import { AxiosInstance } from "axios/dist/axios.min.js";
import Emittery from "emittery";
export default class Singular {
    #private;
    protected _path: string;
    protected _emitter: Emittery;
    protected _ticks: number;
    constructor(path: string, http: AxiosInstance, emitter: Emittery);
    save(): Promise<void>;
    load(): Promise<void>;
    protected _prepareData(): SingularPayload;
    on(ev: "update" | "destroy"): this;
    unsubscribe(): void;
    destroy(): Promise<void>;
}
export interface SingularPayload {
    path: string;
    data: any;
    singular: boolean;
    operation: "save" | "destroy" | "load";
    ticks?: number;
}

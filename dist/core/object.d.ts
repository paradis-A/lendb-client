import ky from "ky";
import Emittery from "emittery";
export default class LenObject {
    private http;
    key: string;
    protected operation: "save" | "load" | "destroy";
    protected ref: string;
    protected loadedRawData: any;
    protected childProps: string[];
    protected singular: boolean;
    protected eventHandles: {
        emit?: boolean;
        hook?: boolean;
    };
    protected httpSettings: any;
    private emitter;
    constructor(ref: string, singularOrKey?: boolean | string, http?: typeof ky, emitter?: Emittery);
    destroy(): Promise<unknown>;
    getOperation(): "save" | "load" | "destroy";
    parse(): any;
    clear(): void;
    commit(): Promise<any>;
    protected stripNonData(clone: this): this;
    /**
     * Loads the data from the database with key provided
     * through constructor.
     * Will return null if object do not exist,
     */
    load(): Promise<any>;
    assign(data: any): this;
    child(childRef: string): this;
    clone(): this;
    /**
     * Gets the data from LenObject.
     */
    toObject(): this;
    /**
     * Mark this Object to be destroyed on calling commit() or commitMany().
     */
    toDestroy(yes?: boolean): this;
}
//# sourceMappingURL=object.d.ts.map
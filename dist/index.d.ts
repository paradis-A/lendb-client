import { AxiosInstance } from "axios/dist/axios.min.js";
import Emittery from "emittery";
import Sockette from "sockette";
import { Writable } from "svelte/store";
declare class LenObject {
    protected _key: string;
    protected _operation: "save" | "load" | "destroy";
    protected _children: LenObject[];
    protected _path: string;
    protected _parentKey: string;
    protected _oldData: {};
    protected _exists: any;
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
interface ObjectPayload {
    data: any;
    key: string;
    operation: "destroy" | "save" | "load";
    path: string;
    singular: boolean;
}
declare class Auth {
    #private;
    emitter: Emittery;
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
declare class LenQuery<Type> {
    #private;
    protected ref: string;
    protected listener: iLiveQuery;
    filters: any;
    sorts: {
        [any: string]: "ASC" | "DESC" | null;
    };
    skip: number;
    limit: number;
    page: number;
    executing: boolean;
    listening: boolean;
    authenticating: boolean;
    timeout: number;
    protected aggregates: Aggregate;
    protected queueBeforeResult: any[];
    protected operation: string;
    protected exclusion: string[];
    protected inclusion: string[];
    protected emitter: Emittery;
    protected hook: boolean;
    protected controller: AbortController;
    protected signal: AbortSignal;
    protected ws: Sockette;
    protected compoundFilter: any;
    constructor(ref: string, http: AxiosInstance, wsUrl: string, emitter: Emittery, auth: Auth);
    get data(): Writable<Type[]>;
    get count(): Writable<number>;
    like(field: string, value: any, pattern: "both" | "left" | "right"): this;
    notLike(field: string, value: string, pattern: "both" | "left" | "right"): this;
    gt(field: string, value: any): this;
    gte(field: string, value: any): this;
    between(field: string, value: any): this;
    notBetween(field: string, value: any): this;
    lt(field: string, value: any): this;
    lte(field: string, value: any): this;
    eq(field: string, value: any): this;
    notEq(field: string, value: any): this;
    in(field: string, value: any[]): this;
    notIn(field: string, value: any[]): this;
    matches(field: string, value: any[]): this;
    notMatches(field: string, value: any[]): this;
    has(field: string, value: any[]): this;
    notHas(field: string, value: any[]): this;
    contains(field: string, value: any[]): this;
    notContains(field: string, value: any[]): this;
    sort(field: string, asc?: boolean): this;
    exclude(fields: string[]): this;
    include(fields: string[]): this;
    aggregate(groupBy: string, cb: (ops: Aggregate) => void | Aggregate): this;
    compound(cb: (filters: CompoundFilter) => void): void;
    protected stripNonQuery(clone: this): this;
    on(cb: (event: iLiveQuery) => void): void;
    clearFilters(): void;
    clearSorts(): void;
    protected toWildCardPath(ref: string): string;
    protected createWS(builtQuery: any): void;
    unsubscribe(): void;
    execute(options?: {
        page?: number;
        limit?: number;
        searchString?: string;
        live: boolean;
        timeout?: number;
    }): Promise<{
        data: Type[];
        count: number;
    }>;
    cancel(): this;
    protected transformFilters(clone: this | any): any[];
}
declare class Aggregate {
    list: {
        field: string;
        operation: "SUM" | "COUNT" | "MIN" | "MAX" | "AVG";
        alias: string;
    }[];
    groupBy: string;
    constructor(groupBy: string);
    sum(field: string, alias: string): this;
    count(field: string, alias: string): this;
    min(field: string, alias: string): this;
    max(field: string, alias: string): this;
    avg(field: string, alias: string): this;
}
declare class iLiveQuery {
    callbacks: Function[];
    protected add: Function;
    protected update: Function;
    protected destroy: Function;
    protected initial: Function;
    onAdd(cb: (e: any, allData: any[]) => void): void;
    onInitial(cb: (e: any, allData: any[]) => void): void;
    onUpdate(cb: (e: any, allData: any[]) => void): void;
    onDestroy(cb: (e: any, allData: any[]) => void): void;
    getEvent(event: "add" | "update" | "destroy" | "initial"): Function;
}
declare class CompoundFilter {
    filters: any;
    like(field: string, value: any, pattern: "both" | "left" | "right"): this;
    notLike(field: string, value: string, pattern: "both" | "left" | "right"): this;
    gt(field: string, value: any): this;
    gte(field: string, value: any): this;
    between(field: string, value: any): this;
    notBetween(field: string, value: any): this;
    lt(field: string, value: any): this;
    lte(field: string, value: any): this;
    eq(field: string, value: any): this;
    notEq(field: string, value: any): this;
    in(field: string, value: any[]): this;
    notIn(field: string, value: any[]): this;
    matches(field: string, value: any[]): this;
    notMatches(field: string, value: any[]): this;
    has(field: string, value: any[]): this;
    notHas(field: string, value: any[]): this;
    contains(field: string, value: any[]): this;
    notContains(field: string, value: any[]): this;
}
export default class LenDB {
    #private;
    readonly Auth: Auth;
    readonly http: AxiosInstance;
    readonly wsURL: string;
    constructor(host?: string, port?: number, secure?: boolean);
    Object<T>(ref: string, key?: string): Object;
    Singular(path: string): void;
    Commit(data: Object[]): Promise<any>;
    Query<T>(ref: string): Query<T>;
}

//# sourceMappingURL=index.d.ts.map

import Emittery from "emittery";
import ky from "ky";
import Sockette from "sockette";
import { Writable } from "svelte/store";
export default class LenQuery<Type> {
    #private;
    filters: any;
    sorts: {
        [any: string]: "ASC" | "DESC" | null;
    };
    protected ref: string;
    protected listener: iLiveQuery;
    skip: number;
    limit: number;
    page: number;
    executing: boolean;
    listening: boolean;
    protected queueBeforeResult: any[];
    protected operation: string;
    protected exclusion: string[];
    protected inclusion: string[];
    protected emitter: Emittery;
    protected hook: boolean;
    protected controller: AbortController;
    protected signal: AbortSignal;
    protected ws: Sockette;
    searchString: string;
    http: typeof ky;
    private wsUrl;
    constructor(ref: string, http: typeof ky, wsUrl: string, emitter: Emittery);
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
    search(word: string): this;
    protected stripNonQuery(clone: this): this;
    on(cb: (event: iLiveQuery) => void): void;
    clearFilters(): void;
    clearSorts(): void;
    protected toWildCardPath(ref: string): string;
    protected createWS(): void;
    unsubscribe(): void;
    execute(options?: {
        page?: number;
        limit?: number;
        searchString?: string;
        live: boolean;
    }): Promise<{
        data: Type[];
        count: number;
    }>;
    cancel(): this;
}
declare class iLiveQuery {
    callbacks: Function[];
    protected add: Function;
    protected update: Function;
    protected destroy: Function;
    protected initial: Function;
    onAdd(cb: (e: any) => void): void;
    onInitial(cb: (e: any) => void): void;
    onUpdate(cb: (e: any) => void): void;
    onDestroy(cb: (e: any) => void): void;
    getEvent(event: "add" | "update" | "destroy" | "initial"): Function;
}
export {};
//# sourceMappingURL=query.d.ts.map
import Emittery from "emittery";
import { AxiosInstance } from "axios/dist/axios.min.js";
import Sockette from "sockette";
import Auth from "./auth";
import { Writable } from "svelte/store";
export default class LenQuery<Type> {
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
    private wsUrl;
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
export declare class CompoundFilter {
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
export {};

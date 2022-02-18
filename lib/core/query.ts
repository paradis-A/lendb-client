import Emittery from "emittery";
import cuid from "cuid";
import ky from "ky";
import cloneDeep from "lodash/cloneDeep";
import isObject from "lodash/isObject";
import Sockette from "sockette";
import Normalize from "./normalize";
import { Writable, writable } from "svelte/store";
export default class LenQuery<Type> {
    filters: any = {};
    sorts: { [any: string]: "ASC" | "DESC" | null } = {};
    protected ref: string;
    protected listener: iLiveQuery;
    skip: number = 0;
    limit: number = 100;
    page: number = 0;
    executing: boolean = false;
    listening: boolean = false;
    #reactiveData: Writable<Type[] | any[]>;
    #reactiveCount: Writable<number>;
    #data: Type[] | any[] = [];
    #count: number = 0;
    #subscriptionKey: string;
    protected aggregates: Aggregate;
    protected queueBeforeResult: any[] = [];
    protected operation: string;
    protected exclusion: string[] = [];
    protected inclusion: string[] = [];
    protected emitter: Emittery;
    protected hook: boolean;
    protected controller!: AbortController;
    protected signal!: AbortSignal;
    protected ws: Sockette;
    searchString: string;
    http: typeof ky;
    private wsUrl: string;
    constructor(
        ref: string,
        http: typeof ky,
        wsUrl: string,
        emitter: Emittery
    ) {
        this.ref = ref;
        this.http = http;
        this.wsUrl = wsUrl;
        this.emitter = emitter;
        this.operation = "query";
        this.#reactiveData = writable([]);
        this.#reactiveCount = writable(0);
        this.#data = [];
        this.#count = 0;
        //TODO: listen on login change websocket subscription key
        // this.emitter.on("change")
    }

    get data(): Writable<Type[]> {
        return this.#reactiveData;
    }

    get count(): Writable<number> {
        return this.#reactiveCount;
    }

    like(field: string, value: any, pattern: "both" | "left" | "right") {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[like]"] = val;
        return this;
    }

    notLike(field: string, value: string, pattern: "both" | "left" | "right") {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[!like]"] = val;
        return this;
    }

    gt(field: string, value: any) {
        this.filters[field + "[>]"] = value;
        return this;
    }

    gte(field: string, value: any) {
        this.filters[field + "[>=]"] = value;
        return this;
    }

    between(field: string, value: any) {
        this.filters[field + "[between]"] = value;
        return this;
    }

    notBetween(field: string, value: any) {
        this.filters[field + "[!between]"] = value;
        return this;
    }

    lt(field: string, value: any) {
        this.filters[field + "[<]"] = value;
        return this;
    }

    lte(field: string, value: any) {
        this.filters[field + "[<=]"] = value;
        return this;
    }

    eq(field: string, value: any) {
        this.filters[field + "[==]"] = value;
        return this;
    }

    notEq(field: string, value: any) {
        this.filters[field + "[!=]"] = value;
        return this;
    }

    in(field: string, value: any[]) {
        this.filters[field + "[in]"] = value;
        return this;
    }

    notIn(field: string, value: any[]) {
        this.filters[field + "[!in]"] = value;
        return this;
    }

    matches(field: string, value: any[]) {
        this.filters[field + "[matches]"] = value;
        return this;
    }

    notMatches(field: string, value: any[]) {
        this.filters[field + "[!matches]"] = value;
        return this;
    }

    has(field: string, value: any[]) {
        this.filters[field + "[has]"] = value;
        return this;
    }

    notHas(field: string, value: any[]) {
        this.filters[field]["!has"] = value;
        return this;
    }

    contains(field: string, value: any[]) {
        this.filters[field]["contains"] = value;
        return this;
    }

    notContains(field: string, value: any[]) {
        this.filters[field]["!contains"] = value;
        return this;
    }

    sort(field: string, asc = false) {
        this.sorts[field] = asc ? "ASC" : "DESC";
        return this;
    }

    exclude(fields: string[]) {
        this.exclusion = fields;
        return this;
    }

    include(fields: string[]) {
        this.inclusion = fields;
        return this;
    }

    search(word: string) {
        this.searchString = word;
        return this;
    }

    aggregate(groupBy: string, cb: (ops: Aggregate) => void | Aggregate) {
        this.aggregates = new Aggregate(groupBy);
        cb(this.aggregates);
        return this;
    }

    protected stripNonQuery(clone: this) {
        delete clone.emitter;
        delete clone.http;
        delete clone.wsUrl;
        delete clone.emitter;
        delete clone.queueBeforeResult;
        delete clone.ws;
        delete clone.signal;
        delete clone.listening;
        delete clone.listener;
        delete clone.emitter;
        return clone;
    }

    on(cb: (event: iLiveQuery) => void) {
        let events = new iLiveQuery();
        cb(events);
        this.listener = events;
    }

    clearFilters() {
        this.filters = {};
    }

    clearSorts() {
        this.sorts = {};
    }

    protected toWildCardPath(ref: string) {
        return ref
            .split("/")
            .map((r) => {
                return cuid.isCuid(r) ? "*" : r;
            })
            .join("/");
    }

    protected createWS(builtQuery: any) {
        let props: any = {
            subscriptionKey: this.#subscriptionKey,
        };
        this.ws = new Sockette(this.wsUrl + "/lenDB", {
            timeout: 5e3,
            maxAttempts: Infinity,
            onopen: () => {
                this.ws.send(JSON.stringify(props));
            },
            onerror: async () => {
                let res: any = await this.http
                .post("lenDB")
                .json(); 
                props = {
                    subscriptionKey: this.#subscriptionKey,
                    query: builtQuery,
                    reconnect: true,
                    key: res.key
                }
            },
            onmessage: (e) => {
                let payload: any = e.data;
                if (typeof e.data == "string") payload = JSON.parse(e.data);
                if (payload.type == "add") {
                    if (this.listener && this.listener.getEvent("add")) {
                        this.listener.getEvent("add")(payload?.data);
                    }
                    this.#data = payload?.newData;
                    this.#count = payload?.count || payload.count;
                    this.#reactiveCount.set(payload?.count);
                    this.#reactiveData.set(this.#data);
                }
                if (payload.type == "update") {
                    if (this.listener && this.listener.getEvent("update")) {
                        this.listener.getEvent("update")(payload?.data);
                    }
                    this.#data = payload?.newData;
                    this.#count = payload?.count || payload.count;
                    this.#reactiveCount.set(this.#count);
                    this.#reactiveData.set(this.#data);
                }

                if (payload.type == "destroy") {
                    if (this.listener && this.listener.getEvent("destroy")) {
                        this.listener.getEvent("destroy")(payload?.data);
                    }
                    this.#data = payload?.newData;
                    this.#count = payload?.count || payload.count;
                    this.#reactiveCount.set(this.#count);
                    this.#reactiveData.set(this.#data);
                }
            },
        });
        this.listening = true;
    }

    unsubscribe() {
        if (this.ws) {
            this.#subscriptionKey = null;
            this.ws.close(1000, "unsubscribe");
        }
    }

    async execute(
        options: {
            page?: number;
            limit?: number;
            searchString?: string;
            live: boolean;
        } = {
            live: true,
        }
    ): Promise<{ data: Type[]; count: number }> {
        try {
            if (
                this.ref.includes("__users__") ||
                this.ref.includes("__tokens__")
            ) {
                return Promise.reject(
                    "Error: cannot access secured refferences use  instance.User() instead."
                );
            }
            if (typeof options.live == "undefined") options.live = true;
            if (this.executing) {
                this.cancel();
            }
            const { page, limit } = options;
            if (page && typeof page == "number") {
                this.page = page;
            }
            if (limit && typeof limit == "number") {
                this.limit = limit;
            }
            if (typeof options.searchString == "string") {
                this.searchString = options.searchString;
            }
            let clone = this.stripNonQuery(cloneDeep(this));
            if (!clone.searchString || typeof clone.searchString != "string") {
                delete clone.searchString;
            }
            //clear white spaces on each string
            if (clone.searchString) {
                let noWhiteSpace = clone.searchString.split(" ");
                if (noWhiteSpace.every((v) => v == "")) {
                    delete clone.searchString;
                }
                if (!clone.searchString.length) {
                    delete clone.searchString;
                }
            }
            //filter processing
            if (
                clone.filters &&
                isObject(clone.filters) &&
                Object.entries(clone.filters).length
            ) {
                let tempFilters = [];
                for (const entry of Object.entries(clone.filters)) {
                    let key = entry[0];
                    let value = entry[1];
                    if (key.includes("[") || key.includes("]")) {
                        let start = key.indexOf("[");
                        let end = key.indexOf("]");
                        if (start == -1 || end == -1) {
                            throw new Error("Filter must be enclosed with []");
                        }
                        let filter = key.substring(start + 1, end);
                        let field = key.substring(0, start);
                        if (operatorBasis.includes(filter)) {
                            if (filter == "in" && !Array.isArray(value))
                                throw new Error("Invalid filter");
                            if (filter == "between" && !Array.isArray(value))
                                throw new Error("Invalid filter");
                            const alphaOperators = {
                                eq: "==",
                                neq: "!=",
                                gt: ">",
                                gte: ">=",
                                lt: "<",
                                lte: "<=",
                            };
                            if (filter.startsWith("not")) {
                                let transformedFilter = Object.keys(
                                    alphaOperators
                                ).includes(filter.substring(2).toLowerCase())
                                    ? alphaOperators[
                                          filter.substring(2).toLowerCase()
                                      ]
                                    : filter.substring(2).toLowerCase();
                                tempFilters.push([
                                    field,
                                    transformedFilter,
                                    value,
                                ]);
                            } else {
                                tempFilters.push([field, filter, value]);
                            }
                        } else {
                            throw new Error("Invalid filter");
                        }
                    } else {
                        if (Array.isArray(value)) {
                            tempFilters.push([key, "in", value]);
                        } else {
                            tempFilters.push([key, "==", value]);
                        }
                    }
                }
                //@ts-ignore
                clone.filters = tempFilters;
            } else {
                //@ts-ignore
                clone.filters = [];
            }
            if (clone.aggregates && clone?.aggregates.list.length) {
                const { groupBy, list } = clone.aggregates;
                //@ts-ignore
                clone.aggregates = { groupBy, list };
            }
            if (
                clone.sorts &&
                isObject(clone.sorts) &&
                Object.entries(clone.sorts).length
            ) {
                let tempSorts = [];
                for (const entry of Object.entries(clone.sorts)) {
                    let key = entry[0];
                    let value = entry[1];
                    if (value == "ASC") {
                        tempSorts.push([key, true]);
                    } else if (value == "DESC") {
                        tempSorts.push([key, false]);
                    }
                }
                //@ts-ignore
                clone.sorts = tempSorts;
            }
            this.unsubscribe();
            this.listening = false;
            if (options.live == true) {
                this.#subscriptionKey = cuid();
                //@ts-ignore
                clone.subscriptionKey = this.#subscriptionKey;
                //@ts-ignore
                clone.live = true;
                this.createWS(clone);
            } else {
                this.ws = null;
                this.#subscriptionKey = null;
            }
            this.controller = new AbortController();
            this.signal = this.controller.signal;
            this.signal.onabort = () => {
                Promise.reject("Query Cancelled");
            };
            this.executing = true;
            let res: any = await this.http
                .post("lenDB", {
                    signal: this.signal,
                    body: JSON.stringify(clone),
                })
                .json();
            let tempData = res?.data;
            if (tempData && Array.isArray(tempData)) {
                tempData = tempData.map((data) => {
                    return Normalize(data);
                });
            }

            this.#data = tempData;
            this.#count = res.count;
            this.#reactiveData.set(tempData);
            this.#reactiveCount.set(res?.count);
            res.data = tempData;
            // this.executing = false
            return Promise.resolve(res);
        } catch (error) {
            this.executing = false;
            this.listening = false;
            this.ws = null;
            return Promise.reject(error);
        }
    }

    cancel() {
        if (this.controller) {
            this.controller.abort();
            this.executing = false;
        }
        return this;
    }
}

class Aggregate {
    list: {
        field: string;
        operation: "SUM" | "COUNT" | "MIN" | "MAX" | "AVG";
        alias: string;
    }[] = [];
    groupBy: string;
    constructor(groupBy: string) {
        this.groupBy = groupBy;
    }

    sum(field: string, alias: string) {
        this.list.push({ field, operation: "SUM", alias });
        return this;
    }

    count(field: string, alias: string) {
        this.list.push({ field, operation: "COUNT", alias });
        return this;
    }

    min(field: string, alias: string) {
        this.list.push({ field, operation: "MIN", alias });
        return this;
    }

    max(field: string, alias: string) {
        this.list.push({ field, operation: "MAX", alias });
        return this;
    }

    avg(field: string, alias: string) {
        this.list.push({ field, operation: "AVG", alias });
        return this;
    }
}

class iLiveQuery {
    callbacks: Function[] = [];
    protected add: Function = null;
    protected update: Function = null;
    protected destroy: Function = null;
    protected initial: Function = null;

    onAdd(cb: (e: any,allData:any[]) => void) {
        this.add = cb;
    }

    onInitial(cb: (e: any,allData:any[]) => void) {
        this.initial = cb;
    }

    onUpdate(cb: (e: any,allData:any[]) => void) {
        this.update = cb;
    }

    onDestroy(cb: (e: any,allData:any[]) => void) {
        this.destroy = cb;
    }

    getEvent(event: "add" | "update" | "destroy" | "initial") {
        if (event == "add") return this.add;
        if (event == "update") return this.update;
        if (event == "destroy") return this.destroy;
        if (event == "initial") return this.initial;
    }
}

const operatorBasis = [
    "eq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "in",
    "neq",
    "has",
    "notHas",
    "contains",
    "notContains",
    "notLike",
    "between",
    "notIn",
    "notBetween",
    "matches",
    "notEq",
    "notMatches",
    "!eq",
    "!has",
    "!contains",
    "!like",
    "!between",
    "!in",
    "!matches",
    "==",
    "!=",
    ">=",
    "<=",
    ">",
    "<",
];
import $4QiMX$emittery from "emittery";
import $4QiMX$axiosdistaxiosminjs from "axios/dist/axios.min.js";
import $4QiMX$cuid from "cuid";
import $4QiMX$lodashcloneDeep from "lodash/cloneDeep";
import $4QiMX$lodashflattenDepth from "lodash/flattenDepth";
import $4QiMX$lodashisDate from "lodash/isDate";
import $4QiMX$lodashisObject from "lodash/isObject";
import $4QiMX$sockette from "sockette";
import {writable as $4QiMX$writable} from "svelte/store";
import $4QiMX$lodashisEqual from "lodash/isEqual";
import $4QiMX$simplecryptojs from "simple-crypto-js";







function $611d7b3b627b7d6a$export$2e2bcd8739ae039(data) {
    let res = {
    };
    if ($4QiMX$lodashisObject(data)) {
        let entries = Object.entries(data);
        for (const entry of entries){
            const key = entry[0];
            const value = entry[1];
            if ($4QiMX$lodashisObject(value) && !$4QiMX$lodashisDate(value)) {
                let keys = Object.keys(value);
                let tempObj = {
                };
                if (keys.every((k)=>$4QiMX$cuid.isCuid(k)
                )) tempObj = Object.values(value).map((t)=>$611d7b3b627b7d6a$export$2e2bcd8739ae039(t)
                );
                else tempObj = value;
                // console.log(Normalize(tempObj))
                res[key] = tempObj;
            } else res[key] = value;
        }
    }
    return res;
}


class $6ee9e98622cf64a5$export$2e2bcd8739ae039 {
    _http;
    _key;
    _operation;
    _children = [];
    _path;
    _parentKey;
    _oldData = {
    };
    _exists = undefined;
    _emitter;
    constructor(path, key, http, emitter){
        this._operation = "save";
        if (typeof key == "string" && !$4QiMX$cuid.isCuid(key)) throw Error("Invalid key");
        else if (typeof key == "undefined" || key == null) this.key = $4QiMX$cuid();
        else this.key = key;
        this._http = http;
        this._emitter = emitter;
        this._path = path;
    }
    get key() {
        return this._key;
    }
    set key(value) {
        if (!$4QiMX$cuid.isCuid(value)) throw Error("Invalid key");
        if (this._children.length) for(let i = 0; i < this._children.length; i++)this._children[i]._parentKey = value;
        this._key = value;
    }
    async destroy() {
        try {
            let payload = {
                key: this._key,
                ref: this._path,
                operation: "destroy"
            };
            let res = (await this._http.post("lenDB", JSON.stringify(payload))).data;
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    _createWS() {
    }
    on(ev) {
    }
    onChild(child, ev) {
    }
    listen() {
    }
    _isUpdated() {
    }
    getOperation() {
        return this._operation;
    }
    getPath() {
        return this._path;
    }
    parse() {
        try {
            let parsed = [];
            if (this._path.includes("*")) throw Error("Error: Adding or Updating must not contain wildcard path.");
            //@ts-ignore
            let temp = {
            };
            temp.key = this._key;
            temp.operation = this._operation;
            temp.singular = false;
            temp.path = this._path;
            if (this._operation == "save") {
                temp.data = this.stripNonData(Object.assign({
                }, this));
                temp.key = this._key;
                if (this._children.length) parsed = $4QiMX$lodashflattenDepth([
                    temp,
                    ...this._children.map((c)=>c.parse()
                    )
                ], 1);
                else parsed = [
                    temp
                ];
            } else if (this._operation == "destroy") {
                temp.key = this._key;
                parsed = [
                    temp
                ];
            }
            return [
                ...parsed
            ];
        } catch (error) {
            throw new Error(error);
        }
    }
    new() {
        return new $6ee9e98622cf64a5$export$2e2bcd8739ae039(this._path, null, this._http, this._emitter);
    }
    async commit() {
        try {
            let payloads = this.parse();
            let payload;
            // console.log(payload)
            // return payload
            if (Array.isArray(payloads) && payloads.length == 1) payload = payloads[0];
            let res = (await this._http.post("lenDB", JSON.stringify(payload || payloads))).data;
            if (this._operation == "destroy") this.new();
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    stripNonData(clone) {
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
     */ async load(settings) {
        try {
            let payload = {
                operation: "load",
                key: this._key,
                ref: this._path
            };
            let res = (await this._http.post("lenDB", JSON.stringify(payload))).data;
            console.log("load result", res);
            if (res) return Promise.resolve($611d7b3b627b7d6a$export$2e2bcd8739ae039(res));
            else return Promise.resolve({
                key: this._key
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
    assign(data) {
        let temp = $4QiMX$lodashcloneDeep(data);
        delete temp.childProps;
        delete temp.eventHandles;
        delete temp.loadedRawData;
        delete temp.ref;
        delete temp.serializer;
        delete temp.key;
        Object.assign(this, temp);
        return this;
    }
    child(path, key) {
        let combinedPath = this._path + "/" + this._key + "/" + path;
        if ($4QiMX$cuid.isCuid(key)) {
            const existingIndex = this._children.findIndex((c)=>c.getPath() == combinedPath && c._key == key
            );
            if (existingIndex > -1) return this._children[existingIndex];
        }
        this._children.push(new $6ee9e98622cf64a5$export$2e2bcd8739ae039(combinedPath, key, this._http, this._emitter));
        return this._children[this._children.length - 1];
    }
    /**
     * Mark this Object to be destroyed on calling commit() or commitMany().
     */ toDestroy(yes = true) {
        this._operation = yes ? "destroy" : "save";
        return this;
    }
}









class $9477ecee74bb3d7f$export$66d311bf29d5c89c extends Error {
    constructor(message){
        super(message);
        this.name = 'TimeoutError';
    }
}
function $9477ecee74bb3d7f$export$2e2bcd8739ae039(promise, milliseconds, fallback, options) {
    let timer;
    const cancelablePromise = new Promise((resolve, reject)=>{
        if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
        if (milliseconds === Number.POSITIVE_INFINITY) {
            resolve(promise);
            return;
        }
        options = {
            customTimers: {
                setTimeout: setTimeout,
                clearTimeout: clearTimeout
            },
            ...options
        };
        timer = options.customTimers.setTimeout.call(undefined, ()=>{
            if (typeof fallback === 'function') {
                try {
                    resolve(fallback());
                } catch (error) {
                    reject(error);
                }
                return;
            }
            const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
            const timeoutError = fallback instanceof Error ? fallback : new $9477ecee74bb3d7f$export$66d311bf29d5c89c(message);
            if (typeof promise.cancel === 'function') promise.cancel();
            reject(timeoutError);
        }, milliseconds);
        (async ()=>{
            try {
                resolve(await promise);
            } catch (error) {
                reject(error);
            } finally{
                options.customTimers.clearTimeout.call(undefined, timer);
            }
        })();
    });
    //@ts-ignore
    cancelablePromise.clear = ()=>{
        clearTimeout(timer);
        timer = undefined;
    };
    return cancelablePromise;
}



async function $2611eea0cfdac120$export$2e2bcd8739ae039(condition, options = {
}) {
    const { interval: interval = 20 , timeout: timeout = Number.POSITIVE_INFINITY , before: before = true  } = options;
    let retryTimeout;
    const promise = new Promise((resolve, reject)=>{
        const check = async ()=>{
            try {
                const value = await condition();
                if (typeof value !== 'boolean') throw new TypeError('Expected condition to return a boolean');
                if (value === true) //@ts-ignore
                resolve();
                else retryTimeout = setTimeout(check, interval);
            } catch (error) {
                reject(error);
            }
        };
        if (before) check();
        else retryTimeout = setTimeout(check, interval);
    });
    if (timeout !== Number.POSITIVE_INFINITY) try {
        //@ts-ignore
        return await $9477ecee74bb3d7f$export$2e2bcd8739ae039(promise, timeout);
    } catch (error) {
        if (retryTimeout) clearTimeout(retryTimeout);
        throw error;
    }
    return promise;
}


class $01f35428435a00d7$export$2e2bcd8739ae039 {
    ref;
    listener;
    filters = {
    };
    sorts = {
    };
    skip = 0;
    limit = 100;
    page = 0;
    executing = false;
    listening = false;
    authenticating = false;
    #reactiveData;
    #reactiveCount;
    #data = [];
    #count = 0;
    #initialDataReceived = false;
    timeout = 60000;
    #subscriptionKey;
    aggregates;
    queueBeforeResult = [];
    operation;
    exclusion = [];
    inclusion = [];
    emitter;
    hook;
    controller;
    signal;
    ws;
    compoundFilter = {
    };
    #ws_key;
    #http;
    wsUrl;
    constructor(ref, http, wsUrl, emitter, auth){
        this.ref = ref;
        this.#http = http;
        this.wsUrl = wsUrl;
        this.emitter = emitter;
        this.operation = "query";
        this.#reactiveData = $4QiMX$writable([]);
        this.#reactiveCount = $4QiMX$writable(0);
        this.#data = [];
        this.#count = 0;
        this.emitter.on("login", ()=>{
            if (this.listening) {
                this.cancel();
                this.execute();
            }
        });
        this.emitter.on("logout", ()=>{
            this.#ws_key = null;
            if (this.listening || this.executing) {
                this.cancel();
                this.unsubscribe();
            }
        });
    }
    get data() {
        return this.#reactiveData;
    }
    get count() {
        return this.#reactiveCount;
    }
    like(field, value, pattern) {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[like]"] = val;
        return this;
    }
    notLike(field, value, pattern) {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[!like]"] = val;
        return this;
    }
    gt(field, value) {
        this.filters[field + "[>]"] = value;
        return this;
    }
    gte(field, value) {
        this.filters[field + "[>=]"] = value;
        return this;
    }
    between(field, value) {
        this.filters[field + "[between]"] = value;
        return this;
    }
    notBetween(field, value) {
        this.filters[field + "[!between]"] = value;
        return this;
    }
    lt(field, value) {
        this.filters[field + "[<]"] = value;
        return this;
    }
    lte(field, value) {
        this.filters[field + "[<=]"] = value;
        return this;
    }
    eq(field, value) {
        this.filters[field + "[==]"] = value;
        return this;
    }
    notEq(field, value) {
        this.filters[field + "[!=]"] = value;
        return this;
    }
    in(field, value) {
        this.filters[field + "[in]"] = value;
        return this;
    }
    notIn(field, value) {
        this.filters[field + "[!in]"] = value;
        return this;
    }
    matches(field, value) {
        this.filters[field + "[matches]"] = value;
        return this;
    }
    notMatches(field, value) {
        this.filters[field + "[!matches]"] = value;
        return this;
    }
    has(field, value) {
        this.filters[field + "[has]"] = value;
        return this;
    }
    notHas(field, value) {
        this.filters[field]["!has"] = value;
        return this;
    }
    contains(field, value) {
        this.filters[field]["contains"] = value;
        return this;
    }
    notContains(field, value) {
        this.filters[field]["!contains"] = value;
        return this;
    }
    sort(field, asc = false) {
        this.sorts[field] = asc ? "ASC" : "DESC";
        return this;
    }
    exclude(fields) {
        this.exclusion = fields;
        return this;
    }
    include(fields) {
        this.inclusion = fields;
        return this;
    }
    aggregate(groupBy, cb) {
        this.aggregates = new $01f35428435a00d7$var$Aggregate(groupBy);
        cb(this.aggregates);
        return this;
    }
    compound(cb) {
        let tempcf = new $01f35428435a00d7$export$1765f4f49c245824();
        cb(tempcf);
        this.compoundFilter = tempcf.filters;
    }
    stripNonQuery(clone) {
        delete clone.emitter;
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
    on(cb) {
        let events = new $01f35428435a00d7$var$iLiveQuery();
        cb(events);
        this.listener = events;
    }
    clearFilters() {
        this.filters = {
        };
    }
    clearSorts() {
        this.sorts = {
        };
    }
    toWildCardPath(ref) {
        return ref.split("/").map((r)=>{
            return $4QiMX$cuid.isCuid(r) ? "*" : r;
        }).join("/");
    }
    createWS(builtQuery) {
        try {
            let props = {
                subscriptionKey: this.#subscriptionKey,
                query: builtQuery
            };
            let ws_auth_canceller = $4QiMX$axiosdistaxiosminjs.CancelToken.source();
            this.ws = new $4QiMX$sockette(this.wsUrl + "/lenDB", {
                timeout: 5000,
                maxAttempts: Infinity,
                onopen: ()=>{
                    if (!this.authenticating) {
                        this.authenticating = true;
                        const ws_authenticator = Object.assign($4QiMX$axiosdistaxiosminjs, this.#http);
                        ws_authenticator.post("lenDB_Auth", JSON.stringify({
                            type: "authenticate_ws"
                        }), {
                            timeout: Infinity,
                            cancelToken: ws_auth_canceller.token
                        }).then((r)=>{
                            const res = r.data;
                            this.authenticating = false;
                            if (this.#ws_key && res?.public == true) this.#ws_key = null;
                            if (res.key) this.#ws_key = res.key;
                            if (res.public) props.public = res.public;
                            props.key = this.#ws_key;
                            this.ws.send(JSON.stringify(props));
                        }).catch((e)=>{
                            console.log("Cannot authenticate websocket connection. Retrying.");
                        });
                        delete props.reconnect;
                    }
                },
                onerror: (e)=>{
                    if (!this.authenticating) props.reconnect = true;
                    else ws_auth_canceller.cancel();
                },
                onreconnect: ()=>{
                    console.log("Disconnected to the server. Reconnecting.");
                },
                onclose: ()=>{
                    this.listening = false;
                },
                onmessage: (e)=>{
                    let payload = e.data;
                    if (typeof e.data == "string") payload = JSON.parse(e.data);
                    if (payload.type == "add") {
                        if (this.listener && this.listener.getEvent("add")) this.listener.getEvent("add")(payload?.newData);
                        let tempData = payload?.data;
                        if (tempData && Array.isArray(tempData)) tempData = tempData.map((data)=>{
                            return $611d7b3b627b7d6a$export$2e2bcd8739ae039(data);
                        });
                        this.#data = tempData;
                        this.#count = payload?.count || payload.count;
                        this.#reactiveCount.set(this.#count);
                        this.#reactiveData.set(this.#data);
                    }
                    if (payload.type == "update") {
                        if (this.listener && this.listener.getEvent("update")) this.listener.getEvent("update")(payload?.newData);
                        let tempData = payload?.data;
                        if (tempData && Array.isArray(tempData)) tempData = tempData.map((data)=>{
                            return $611d7b3b627b7d6a$export$2e2bcd8739ae039(data);
                        });
                        this.#data = tempData;
                        this.#count = payload?.count || payload.count;
                        this.#reactiveCount.set(this.#count);
                        this.#reactiveData.set(this.#data);
                    }
                    if (payload.type == "initialdata") {
                        let tempData = payload?.data;
                        if (tempData && Array.isArray(tempData)) tempData = tempData.map((data)=>{
                            return $611d7b3b627b7d6a$export$2e2bcd8739ae039(data);
                        });
                        this.#data = tempData;
                        this.#count = payload?.count || payload.count;
                        this.#reactiveCount.set(this.#count);
                        this.#reactiveData.set(this.#data);
                        this.#initialDataReceived = true;
                    }
                    if (payload.type == "destroy") {
                        if (this.listener && this.listener.getEvent("destroy")) this.listener.getEvent("destroy")(payload?.newData);
                        let tempData = payload?.data;
                        if (tempData && Array.isArray(tempData)) tempData = tempData.map((data)=>{
                            return $611d7b3b627b7d6a$export$2e2bcd8739ae039(data);
                        });
                        this.#data = tempData;
                        this.#count = payload?.count || payload.count;
                        this.#reactiveCount.set(this.#count);
                        this.#reactiveData.set(this.#data);
                    }
                }
            });
            this.listening = true;
        } catch (error) {
            console.log(error);
        }
    }
    unsubscribe() {
        if (this.ws) {
            this.#subscriptionKey = null;
            this.listening = false;
            this.ws.close(1000, "unsubscribe");
        }
    }
    async execute(options = {
        live: true
    }) {
        try {
            if (this.ref.includes("__users__") || this.ref.includes("__tokens__")) return Promise.reject("Error: cannot access secured refferences use  instance.User() instead.");
            if (typeof options.live == "undefined") options.live = true;
            if (this.executing) this.cancel();
            const { page: page , limit: limit , timeout: timeout  } = options;
            if (page && typeof page == "number") this.page = page;
            if (limit && typeof limit == "number") this.limit = limit;
            if (timeout && typeof timeout == "number") this.timeout = timeout;
            let clone = this.stripNonQuery($4QiMX$lodashcloneDeep(this));
            //filter processing
            if (clone.filters && $4QiMX$lodashisObject(clone.filters) && Object.entries(clone.filters).length) //@ts-ignore
            clone.filters = this.transformFilters(clone.filters);
            else //@ts-ignore
            clone.filters = [];
            if (clone.compoundFilter && $4QiMX$lodashisObject(clone.compoundFilter) && Object.entries(clone.compoundFilter).length) //@ts-ignore
            clone.compoundFilter = this.transformFilters(clone.compoundFilter);
            else //@ts-ignore
            clone.compoundFilter = [];
            if (clone.aggregates && clone?.aggregates.list.length) {
                const { groupBy: groupBy , list: list  } = clone.aggregates;
                //@ts-ignore
                clone.aggregates = {
                    groupBy: groupBy,
                    list: list
                };
            }
            if (clone.sorts && $4QiMX$lodashisObject(clone.sorts) && Object.entries(clone.sorts).length) {
                let tempSorts = [];
                for (const entry of Object.entries(clone.sorts)){
                    let key = entry[0];
                    let value = entry[1];
                    if (value == "ASC") tempSorts.push([
                        key,
                        true
                    ]);
                    else if (value == "DESC") tempSorts.push([
                        key,
                        false
                    ]);
                }
                //@ts-ignore
                clone.sorts = tempSorts;
            }
            this.unsubscribe();
            this.listening = false;
            this.executing = true;
            let res = {
                data: [],
                count: 0
            };
            let tempData = [];
            //@ts-ignore
            if (clone.aggregates && Object.entries(clone.aggregates).length && clone.compoundFilter.length) throw Error("Error: Cannot aggregate with compundfilter");
            if (!options.live) {
                this.ws = null;
                this.controller = new AbortController();
                this.signal = this.controller.signal;
                this.signal.onabort = ()=>{
                    Promise.reject("Query Cancelled");
                };
                res = (await this.#http.post("lenDB", JSON.stringify(clone), {
                    signal: this.signal
                })).data;
                tempData = res.data;
                if (tempData && Array.isArray(tempData)) tempData = tempData.map((data)=>{
                    return $611d7b3b627b7d6a$export$2e2bcd8739ae039(data);
                });
                this.#data = tempData;
                this.#count = res.count;
                this.#reactiveData.set(tempData);
                this.#reactiveCount.set(res?.count);
                res.data = this.#data;
                this.executing = false;
                return Promise.resolve(res);
            } else {
                //@ts-ignore
                clone.live = true;
                this.createWS(clone);
                await $2611eea0cfdac120$export$2e2bcd8739ae039(()=>{
                    return this.#initialDataReceived;
                }, timeout);
                this.executing = false;
                this.listening = true;
                this.#initialDataReceived = false;
                return Promise.resolve({
                    count: this.#count,
                    data: this.#data
                });
            }
        } catch (error) {
            this.executing = false;
            this.listening = false;
            if (this.ws) this.ws.close();
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
    transformFilters(clone) {
        try {
            let tempFilters = [];
            for (const entry of Object.entries(clone.filters)){
                let key = entry[0];
                let value = entry[1];
                if (key.includes("[") || key.includes("]")) {
                    let start = key.indexOf("[");
                    let end = key.indexOf("]");
                    if (start == -1 || end == -1) throw new Error("Filter must be enclosed with []");
                    let filter = key.substring(start + 1, end);
                    let field = key.substring(0, start);
                    if ($01f35428435a00d7$var$operatorBasis.includes(filter)) {
                        if (filter == "in" && !Array.isArray(value)) throw new Error("Invalid filter");
                        if (filter == "between" && !Array.isArray(value)) throw new Error("Invalid filter");
                        const alphaOperators = {
                            eq: "==",
                            neq: "!=",
                            gt: ">",
                            gte: ">=",
                            lt: "<",
                            lte: "<="
                        };
                        if (filter.startsWith("not")) {
                            let transformedFilter = Object.keys(alphaOperators).includes(filter.substring(2).toLowerCase()) ? alphaOperators[filter.substring(2).toLowerCase()] : filter.substring(2).toLowerCase();
                            tempFilters.push([
                                field,
                                transformedFilter,
                                value
                            ]);
                        } else tempFilters.push([
                            field,
                            filter,
                            value
                        ]);
                    } else throw new Error("Invalid filter");
                } else if (Array.isArray(value)) tempFilters.push([
                    key,
                    "in",
                    value
                ]);
                else tempFilters.push([
                    key,
                    "==",
                    value
                ]);
            }
            return tempFilters;
        } catch (error) {
            throw Error(error);
        }
    }
}
class $01f35428435a00d7$var$Aggregate {
    list = [];
    groupBy;
    constructor(groupBy){
        this.groupBy = groupBy;
    }
    sum(field, alias) {
        this.list.push({
            field: field,
            operation: "SUM",
            alias: alias
        });
        return this;
    }
    count(field, alias) {
        this.list.push({
            field: field,
            operation: "COUNT",
            alias: alias
        });
        return this;
    }
    min(field, alias) {
        this.list.push({
            field: field,
            operation: "MIN",
            alias: alias
        });
        return this;
    }
    max(field, alias) {
        this.list.push({
            field: field,
            operation: "MAX",
            alias: alias
        });
        return this;
    }
    avg(field, alias) {
        this.list.push({
            field: field,
            operation: "AVG",
            alias: alias
        });
        return this;
    }
}
class $01f35428435a00d7$var$iLiveQuery {
    callbacks = [];
    add = null;
    update = null;
    destroy = null;
    initial = null;
    onAdd(cb) {
        this.add = cb;
    }
    onInitial(cb) {
        this.initial = cb;
    }
    onUpdate(cb) {
        this.update = cb;
    }
    onDestroy(cb) {
        this.destroy = cb;
    }
    getEvent(event) {
        if (event == "add") return this.add;
        if (event == "update") return this.update;
        if (event == "destroy") return this.destroy;
        if (event == "initial") return this.initial;
    }
}
const $01f35428435a00d7$var$operatorBasis = [
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
class $01f35428435a00d7$export$1765f4f49c245824 {
    filters = {
    };
    like(field, value, pattern) {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[like]"] = val;
        return this;
    }
    notLike(field, value, pattern) {
        let val = "*" + value + "*";
        if (pattern == "left") val = "*" + value;
        if (pattern == "right") val = value + "*";
        this.filters[field + "[!like]"] = val;
        return this;
    }
    gt(field, value) {
        this.filters[field + "[>]"] = value;
        return this;
    }
    gte(field, value) {
        this.filters[field + "[>=]"] = value;
        return this;
    }
    between(field, value) {
        this.filters[field + "[between]"] = value;
        return this;
    }
    notBetween(field, value) {
        this.filters[field + "[!between]"] = value;
        return this;
    }
    lt(field, value) {
        this.filters[field + "[<]"] = value;
        return this;
    }
    lte(field, value) {
        this.filters[field + "[<=]"] = value;
        return this;
    }
    eq(field, value) {
        this.filters[field + "[==]"] = value;
        return this;
    }
    notEq(field, value) {
        this.filters[field + "[!=]"] = value;
        return this;
    }
    in(field, value) {
        this.filters[field + "[in]"] = value;
        return this;
    }
    notIn(field, value) {
        this.filters[field + "[!in]"] = value;
        return this;
    }
    matches(field, value) {
        this.filters[field + "[matches]"] = value;
        return this;
    }
    notMatches(field, value) {
        this.filters[field + "[!matches]"] = value;
        return this;
    }
    has(field, value) {
        this.filters[field + "[has]"] = value;
        return this;
    }
    notHas(field, value) {
        this.filters[field]["!has"] = value;
        return this;
    }
    contains(field, value) {
        this.filters[field]["contains"] = value;
        return this;
    }
    notContains(field, value) {
        this.filters[field]["!contains"] = value;
        return this;
    }
}





class $6bb633068a343f9f$export$2e2bcd8739ae039 {
    //server must respond to encrypt the cache: the key will be based on the httpOnly cookie
    #storageKey;
    #http;
    #client_key;
    #svelteStorage = $4QiMX$writable({
    });
    emitter;
    #crypto;
    baseUrl;
    constructor(http, baseUrl, emitter){
        this.#http = http;
        this.emitter = emitter;
        this.baseUrl = baseUrl;
        window.onstorage = (ev)=>{
            //check if starts with the  cached key is called then decrypt it
            let matched = ev.key.startsWith("cache:" + this.baseUrl);
            if (matched) {
                if (!this.#client_key) this.Authenticate().then(()=>{
                    this.emitter.emit("login");
                });
                else {
                    if (ev.newValue == null) {
                        this.#client_key = null;
                        this.Logout();
                    }
                    this.emitter.emit("logout");
                }
            }
        };
    }
     #createStorageKey() {
        if (this.#client_key) {
            this.#crypto = new $4QiMX$simplecryptojs(this.#client_key);
            return "cache:" + this.baseUrl + this.#crypto.encrypt("you got me!");
        } else throw new Error("Client key is required when creating secured storage key.");
    }
    async Login(usernameOrEmail, password) {
        try {
            this.#removeCached();
            if (typeof usernameOrEmail != "string") return Promise.resolve("Invalid username/email format");
            if (typeof password != "string") return Promise.resolve("Invalid password format");
            let res = (await this.#http.post("lenDB_Auth", JSON.stringify({
                username: usernameOrEmail,
                password: password,
                type: "login"
            }))).data;
            const { data: data , client_key: client_key  } = res;
            this.#client_key = client_key;
            this.#storageKey = this.#createStorageKey();
            this.emitter.emit("set:client_key", this.#client_key);
            localStorage.setItem(this.#storageKey, this.#crypto.encrypt(res));
            this.#svelteStorage.set(data);
            this.emitter.emit("login");
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    on(event, callback) {
    }
    isValidEmail(email) {
        String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }
     #removeCached() {
        let keys = Object.entries(localStorage).map((ls)=>typeof ls[0] == "string" ? ls[0] : "ignore"
        ).filter((ls)=>ls.startsWith("cache:" + this.baseUrl)
        );
        keys.forEach((k)=>localStorage.removeItem(k)
        );
    }
    async Register(credentials) {
        try {
            if (credentials) {
                if (typeof credentials.username != "string") return Promise.reject("argument username expected to be string");
                if (typeof credentials.password != "string") return Promise.reject("argument password expected to be string");
                if (typeof credentials.email != "string" || this.isValidEmail(credentials.email)) return Promise.reject("invalid email");
                //@ts-ignore
                credentials.type = "register";
                let res = (await this.#http.post("lenDB_Auth", JSON.stringify(credentials))).data;
                const { data: data , client_key: client_key  } = res;
                this.#client_key = client_key;
                this.#storageKey = this.#createStorageKey();
                this.emitter.emit("set:client_key", this.#client_key);
                localStorage.setItem(this.#storageKey, this.#crypto.encrypt(res));
                this.#svelteStorage.set(data);
                return Promise.resolve(res);
            } else return Promise.reject("credentials argument expected");
        } catch (error) {
            return Promise.reject(error);
        }
    }
    async Logout() {
        try {
            this.#removeCached();
            this.#svelteStorage.set({
            });
            this.#client_key = undefined;
            let res = (await this.#http.post("lenDB_Auth", JSON.stringify({
                type: "logout"
            }))).data;
            this.emitter.emit("logout");
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    async Update(userInfo) {
        try {
            let res = (await this.#http.post("lenDB_Auth", {
                type: "update",
                ...userInfo
            })).data;
            // this.#storage.set(this.#storageKey, res);
            this.#svelteStorage.set(res);
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    Me() {
        this.Authenticate();
        return Object.assign(this.#svelteStorage);
    }
    async Authenticate() {
        try {
            let res = (await this.#http.post("lenDB_Auth", JSON.stringify({
                type: "authenticate"
            }))).data;
            const { data: data , client_key: client_key  } = res;
            if (client_key && data) {
                // this.#removeCached()
                this.#client_key = client_key;
                // this.#storageKey = this.#createStorageKey();
                this.#crypto = new $4QiMX$simplecryptojs(this.#client_key);
                const suffix = "cache:" + this.baseUrl;
                const foundStorageKey = Object.entries(localStorage).find((ls)=>typeof ls[0] == "string" && ls[0].startsWith(suffix)
                );
                if (foundStorageKey) {
                    const currentStorageKey = foundStorageKey[0];
                    const matched = this.#crypto.decrypt(currentStorageKey.substring(suffix.length));
                    if ("you got me!" === matched) {
                        const currentlyStored = localStorage.getItem(currentStorageKey);
                        const decrypted = this.#crypto.decrypt(currentlyStored);
                        if (!$4QiMX$lodashisEqual(decrypted, data)) localStorage.setItem(currentStorageKey, this.#crypto.encrypt(data));
                    }
                } else await this.Logout();
                this.emitter.emit("set:client_key", this.#client_key);
                this.#svelteStorage.set(data);
            }
            return Promise.resolve(data);
        } catch (error) {
            if (error.response.data.message == "Invalid Token") this.Logout();
            return Promise.reject(error);
        }
    }
}



async function $5dba12832b4e39f3$export$2e2bcd8739ae039(data, http) {
    try {
        if (Array.isArray(data)) {
            if (data.every((d)=>d instanceof $6ee9e98622cf64a5$export$2e2bcd8739ae039
            )) {
                if (data.some((d)=>d.getOperation() == "load"
                )) Promise.reject("Error: commit does not support load operation");
                let payload = data.map((d)=>d.parse()
                );
                let res = (await http.post("lenDB", payload)).data;
                data.forEach((d, index)=>{
                    if (data[index].getOperation() == "destroy") data[index].new();
                });
                return Promise.resolve(res);
            } else Promise.reject("Error: Invalid argument.");
        } else Promise.reject("Error: argument must be array");
    } catch (error) {
        Promise.reject(error);
    }
}




class $d1b6f3eb4e18b0a5$export$2e2bcd8739ae039 {
    Auth;
    http;
    wsURL;
    baseURL;
    #Emitter;
    //if has client id but no cache then
    //if has client_id but invalid
    constructor(host = "localhost", port = 5757, secure = false){
        this.baseURL = (secure ? "https://" : "http://") + host + ":" + port;
        this.wsURL = (secure ? "wss://" : "ws://") + host + ":" + port;
        this.http = $4QiMX$axiosdistaxiosminjs.create({
            baseURL: this.baseURL,
            withCredentials: true,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        this.#Emitter = new $4QiMX$emittery();
        this.Auth = new $6bb633068a343f9f$export$2e2bcd8739ae039(this.http, this.baseURL, this.#Emitter);
    }
    Object(ref, key) {
        function IdentifiableSubclass(SuperClass) {
            class C extends SuperClass {
            }
            return C;
        }
        const ObjectWrapper = IdentifiableSubclass($6ee9e98622cf64a5$export$2e2bcd8739ae039);
        return new ObjectWrapper(ref, key, this.http, this.#Emitter);
    }
    Singular(path) {
    }
    Commit(data) {
        return $5dba12832b4e39f3$export$2e2bcd8739ae039(data, this.http);
    }
    // File(file: File) {
    //     return new LenFile(file,this.baseURL,this.http,this.#Emitter);
    // }
    Query(ref) {
        return new $01f35428435a00d7$export$2e2bcd8739ae039(ref, this.http, this.wsURL, this.#Emitter, this.Auth);
    }
}


export {$d1b6f3eb4e18b0a5$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.js.map

import ky from "ky";
// import SimpleCrypto from "simple-crypto-js"
import { writable } from "svelte/store";
import Emittery from "emittery";
import isEqual from "lodash/isEqual";
import Crypto from "simple-crypto-js";
export default class Auth {
    cache: boolean = true;
    //server must respond to encrypt the cache: the key will be based on the httpOnly cookie
    #storageKey: string;
    #http: typeof ky;
    #client_key: string;
    #svelteStorage = writable({});
    emitter: Emittery;
    #crypto: Crypto;
    private baseUrl: string;
    constructor(http: typeof ky, baseUrl?: string, emitter?: Emittery) {
        this.#http = http;
        this.emitter = emitter;
        this.baseUrl = baseUrl;
        window.onstorage = (ev: StorageEvent) => {
            //check if starts with the  cached key is called then decrypt it
            let matched = ev.key.startsWith("cache:" + this.baseUrl);
            if (this.cache) {
                if (matched) {
                    if (!this.#client_key) {
                        this.Authenticate();
                    } else {
                        if (ev.newValue == null) {
                            this.#client_key = null;
                            this.Logout()
                        }
                    }
                }
            }
        };
        emitter.on("set:client_key", () => {});
    }
    
    #createStorageKey() {
        if (this.#client_key) {
            this.#crypto = new Crypto(this.#client_key);
            return (
                "cache:" + this.baseUrl + this.#crypto.encrypt("you got me!")
            );
        } else {
            throw new Error(
                "Client key is required when creating secured storage key."
            );
        }
    }
    
    async Login(usernameOrEmail: string, password: string) {
        try {
            await this.Logout()
            if (typeof usernameOrEmail != "string") {
                return Promise.resolve("Invalid username/email format");
            }
            if (typeof password != "string") {
                return Promise.resolve("Invalid password format");
            }
            let res: any = await this.#http
                .post("lenDB_Auth", {
                    body: JSON.stringify({
                        username: usernameOrEmail,
                        password,
                        type: "login",
                    }),
                })
                .json();
            if (this.cache) {
                const { data, client_key } = res;
                this.#removeCached();
                this.#client_key = client_key;
                this.#storageKey = this.#createStorageKey();
                this.emitter.emit("set:client_key", this.#client_key);
                localStorage.setItem(
                    this.#storageKey,
                    this.#crypto.encrypt(res)
                );
                this.#svelteStorage.set(data);
            }
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    on(event: "logout" | "login" | "update",callback: ()=> void){

    }

    isValidEmail(email: string) {
        String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    #removeCached() {
        let keys = Object.entries(localStorage)
            .map((ls) => typeof ls[0]=="string"? ls[0] : "ignore")
            .filter((ls) => ls.startsWith("cache:" + this.baseUrl));
        keys.forEach((k) => localStorage.removeItem(k));
    }

    async Register(credentials: {
        username: string;
        password: string;
        email: string;
    }) {
        try {
            if (credentials) {
                if (typeof credentials.username != "string") {
                    return Promise.reject(
                        "argument username expected to be string"
                    );
                }
                if (typeof credentials.password != "string") {
                    return Promise.reject(
                        "argument password expected to be string"
                    );
                }
                if (
                    typeof credentials.email != "string" ||
                    this.isValidEmail(credentials.email)
                ) {
                    return Promise.reject("invalid email");
                }
                //@ts-ignore
                credentials.type = "register";
                let res: any = await this.#http
                    .post("lenDB_Auth", {
                        body: JSON.stringify(credentials),
                    })
                    .json();
                if (this.cache) {
                    const { data, client_key } = res;
                    console.log(client_key);
                    this.#client_key = client_key;
                    this.#storageKey = this.#createStorageKey();
                    this.emitter.emit("set:client_key", this.#client_key);
                    localStorage.setItem(
                        this.#storageKey,
                        this.#crypto.encrypt(res)
                    );
                    this.#svelteStorage.set(data);
                }
                return Promise.resolve(res);
            } else {
                return Promise.reject("credentials argument expected");
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async Logout() {
        try {
            //delete all the key starts with the unhashed key i.e. http://localhost:1337
            // this.#storage.remove(this.#storageKey);
            this.#removeCached();
            this.#svelteStorage.set({});
            this.emitter.emit("remove:client_key");
            this.#client_key = undefined;
            let res = await this.#http
                .post("lenDB_Auth", {
                    body: JSON.stringify({ type: "logout" }),
                })
                .json();
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async Update(userInfo: any) {
        try {
            let res = await this.#http
                .post("lenDB_Auth", {
                    body: JSON.stringify({ type: "update", ...userInfo }),
                    credentials: "include",
                })
                .json();
            // this.#storage.set(this.#storageKey, res);
            this.#svelteStorage.set(res);
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    Me(svelteStore = false) {
        if (this.cache) {
            if (svelteStore) {
                this.Authenticate();
                return this.#svelteStorage;
            } else {
                if (this.#client_key) {
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    }

    async Authenticate() {
        try {
            let res: any = await this.#http
                .post("lenDB_Auth", {
                    body: JSON.stringify({ type: "authenticate" }),
                    credentials: "include",
                })
                .json();
            const { data, client_key } = res;
            if (client_key && data) {
                // this.#removeCached()
                if (this.cache) {
                    this.#client_key = client_key;
                    // this.#storageKey = this.#createStorageKey();
                    this.#crypto = new Crypto(this.#client_key);
                    const suffix = "cache:" + this.baseUrl;
                    const foundStorageKey = Object.entries(localStorage).find(
                        (ls) => typeof ls[0] == "string" && ls[0].startsWith(suffix)
                    );
                    if (foundStorageKey) {
                        const currentStorageKey = foundStorageKey[0]
                        const matched = this.#crypto.decrypt(
                            currentStorageKey.substring(suffix.length)
                        );
                        if ("you got me!" === matched) {
                            const currentlyStored =
                                localStorage.getItem(currentStorageKey);
                            const decrypted =
                                this.#crypto.decrypt(currentlyStored);
                            if (!isEqual(decrypted, data)) {
                                localStorage.setItem(
                                    currentStorageKey,
                                    this.#crypto.encrypt(data)
                                );
                            }
                        }
                    } else {
                        await this.Logout();
                    }
                    this.emitter.emit("set:client_key", this.#client_key);
                    // localStorage.setItem(
                    //     this.#storageKey,
                    //     this.#crypto.encrypt(data)
                    // );
                    this.#svelteStorage.set(data);
                } else {
                    this.#removeCached();
                }
            }
            return Promise.resolve(data);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

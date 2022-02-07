import cuid from "cuid";
import cloneDeep from "lodash/cloneDeep";
import ky from "ky"
import Normalize from "./normalize";
import Emittery from "emittery";

export default class LenObject{
    private http: typeof ky
    public key: string;
    protected operation: "save" | "load" | "destroy";
    protected ref: string;
    protected loadedRawData: any;
    protected childProps: string[];
    protected singular: boolean = false;
    protected eventHandles: {emit?:boolean, hook?:boolean} = {hook: true, emit: true}
    protected httpSettings: any
    private emitter: Emittery
    constructor(ref: string, singularOrKey: boolean | string = false,http?: typeof ky,emitter?: Emittery) {
        this.operation = "save"
        this.key = cuid()
        if (
            typeof singularOrKey == "string" &&
            cuid.isCuid(singularOrKey)
        ) {
            this.key = singularOrKey;
        } else if (typeof singularOrKey == "boolean" && singularOrKey) {
            this.singular = singularOrKey;
            this.key = null;
        }
        this.http = http
        this.emitter = emitter
        this.ref = ref;
        const settings = localStorage.getItem("lenDB");
        this.httpSettings = JSON.parse(settings);
    }

    async destroy(){
        try {
            let payload: any = {key: this.key,ref: this.ref,operation: "destroy", singular: this.singular}
            let res=  this.http.post("lenDB",{body: JSON.stringify(payload)}).json()
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    getOperation(): "save" | "load" | "destroy"{
        return this.operation
    }

    parse(){
        try {
            if(this.ref.includes("*")){
                return Promise.reject("Error: Adding or Updating must not contain wildcard path.")
            }
            let clone: any | this = {}
            if(this.operation == "save"){
                clone = this.stripNonData(Object.assign({}, this));
            }else if (this.operation == "destroy") {
                clone = Object.assign({},{
                    operation: clone?.operation,
                    ref: clone.ref,
                    key: clone?.key,
                    singular: clone?.singular
                })
            }
            
            if(!clone.key && clone.singular == false){
                throw new Error("Error: Non-singular must contain key.")
            }
            return clone
        } catch (error) {
            throw new Error(error)
        }
    }

    clear(){
        let data =  this.toObject()
        Object.entries(data).forEach(entry=>{
            delete this[entry[0]]
        })
        this.operation = "save"
    }

    async commit(): Promise<any> {
        try {
            const clone = this.parse()
            let res = await this.http.post("lenDB",{body: JSON.stringify(clone)}).json()
            if(this.operation == "destroy"){
                this.clear()
                this.key = cuid()
            }
            return Promise.resolve(res) 
        } catch (error) {
            return Promise.reject(error )
        }
    }
    
    protected stripNonData(clone: this) {
        delete clone.childProps;
        delete clone.loadedRawData
        delete clone.httpSettings
        delete clone.emitter
        return clone;
    }
    
    /**
     * Loads the data from the database with key provided 
     * through constructor. 
     * Will return null if object do not exist,
     */
    async load() : Promise<any>{
        try {
            let payload: any = { operation: "load",key: this.key, ref: this.ref, singular: this.singular}
            let res = await this.http.post("lenDB",{body: JSON.stringify(payload)}).json()
            console.log("load result", res)
            if(res){
                return Promise.resolve(Normalize(res))
            }else{
                return Promise.resolve({key: this.key})
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    // async exists(): Promise<boolean>{
    //     try {
    //         let payload = {operation: "exists", key: this.key, ref: this.ref, singular: this.singular}
    //         let res = await this.serializer.Execute(payload)
    //         return Promise.resolve(res)
    //     } catch (error) {
    //         return Promise.reject(error)
    //     }
    // }

    assign(data:any): this{
        let temp =  cloneDeep(data)
        delete temp.childProps
        delete temp.eventHandles
        delete temp.loadedRawData
        delete temp.singular
        delete temp.ref
        delete temp.serializer
        delete temp.singular
        Object.assign(this,temp)
        if(temp.key  && !cuid.isCuid(temp.key)){
            throw new Error("Invalid key")
        }else{
            delete temp.key
        }
        return this
    }

    child(childRef: string){
        if(this.singular){
            throw new Error("Error: Singular cannot have child collection")
        }
        let clone = cloneDeep(this)
        clone.clear()
        clone.ref = `${this.ref}/${this.key}/${childRef}`
        clone.operation = "save"
        clone.key = cuid()
        return clone
    }

    clone(){
        return cloneDeep(this)
    }

    /**
     * Gets the data from LenObject.
     */
    toObject() {
        let temp =  cloneDeep(this)
        delete temp.childProps
        delete temp.eventHandles
        delete temp.loadedRawData
        delete temp.singular
        delete temp.ref
        delete temp.operation
        delete temp.httpSettings
        return temp
    }
    /**
     * Mark this Object to be destroyed on calling commit() or commitMany().
     */
    toDestroy(yes = true) {
        this.operation = yes ?  "destroy" : "save"
        return this
    }
}



// import isObject from "lodash/isObject";
// import ky from "ky";
// import cuid from "cuid";
// import Emittery from "emittery";
export default class LenFile {
    // httpSettings!: any;
    // key: string;
    // file:File
    // http: typeof ky
    // uploadsURL: string
    // protected emitter: Emittery
    // constructor(file?:File,baseURL?:string,http?:typeof ky,emitter?:Emittery) {
    //     const settings = localStorage.getItem("lenDB");
    //     this.http = http
    //     this.httpSettings = JSON.parse(settings);
    //     this.file = file
    //     this.emitter = emitter
    //     this.uploadsURL = baseURL + "/uploads"
    //     this.key = cuid();
    // }
    
    // async fetch(key:string): Promise<{ key: string; filename: string; url: string }> {
    //     if (key && !cuid.isCuid(key) || !key) {
    //         throw TypeError("Invalid key");
    //     }
    //     try {
    //         let result: any = await this.http.get("uploads" + "/" + key).json();
    //         result.url = this.uploadsURL + "/" + result.url;
    //         return Promise.resolve(result);
    //     } catch (error) {
    //         return Promise.reject(error);
    //     }
    // }
    
    // async save() {
    //     try {
    //         console.log("saving file")
    //         console.log(this.file)
    //         if (!this.file) {
    //             return Promise.resolve("file argument must be filled.");
    //         }
    //         let fileName = `${this.key}-$-${this.file.name}`;
    //         //@ts-ignore
    //         let tempFile = new File([await this.file.arrayBuffer()], fileName);
    //         let fd = new FormData();
    //         fd.append("file", tempFile);
    //         let res:any = await this.http.post("lenDB_upload", { body: fd }).json();
    //         if(res?.url){
    //             res.url = this.uploadsURL + "/" + res.url
    //         }
    //         return res;
    //     } catch (error) {
    //         return Promise.reject(error);
    //     }
    // }
}

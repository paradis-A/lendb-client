import ky from "ky";
import Emittery from "emittery";
export default class LenFile {
    httpSettings: any;
    key: string;
    file: File;
    http: typeof ky;
    uploadsURL: string;
    protected emitter: Emittery;
    constructor(file?: File, baseURL?: string, http?: typeof ky, emitter?: Emittery);
    fetch(key: string): Promise<{
        key: string;
        filename: string;
        url: string;
    }>;
    save(): Promise<any>;
}

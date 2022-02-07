import Object from "./object";
import ky from "ky";
import cuid from "cuid";
export default async function Commit(data: Object[],http?:typeof ky) {
    try {
        if (Array.isArray(data)) {
            if(data.every(d => d instanceof Object)){
                if(data.some(d=>d.getOperation()=="load")){
                    Promise.reject("Error: commit does not support load operation");
                }
                let payload = data.map(d=>d.parse())
                let res = await http.post("lenDB",{body: JSON.stringify(payload)}).json()
                data.forEach((d,index)=>{
                    if(data[index].getOperation() == "destroy"){
                        data[index].clear()
                        data[index].key = cuid()
                    }
                })
                return Promise.resolve(res) 
            }else{
                Promise.reject("Error: Invalid argument.");
            }
        } else {
            Promise.reject("Error: argument must be array");
        }
    } catch (error) {
        Promise.reject(error);
    }
}

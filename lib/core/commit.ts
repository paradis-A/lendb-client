import Object from "./object";
import {AxiosInstance} from "axios/dist/axios.min.js"
export default async function Commit(data: Object[],http?:AxiosInstance) {
    try {
        if (Array.isArray(data)) {
            if(data.every(d => d instanceof Object)){
                if(data.some(d=>d.getOperation()=="load")){
                    Promise.reject("Error: commit does not support load operation");
                }
                let payload = data.map(d=>d.parse())
                let res = (await http.post("lenDB",payload)).data
                data.forEach((d,index)=>{
                    if(data[index].getOperation() == "destroy"){
                        data[index].new()
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

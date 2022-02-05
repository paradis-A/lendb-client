import DeepProxy from "proxy-deep";
export default function proxyObject() {
    return new DeepProxy(
        {},
        {
            get(target, path, receiver) {
                // console.log("proxy get",target,path)
                if(target[path]==undefined){
                    target[path] = {}
                }
                return target[path]
            },
            set(target,path,value){
                return true
            },
            // apply(target, thisArg, argList) {
            //     return this.path;
            // },
        }
    );
}

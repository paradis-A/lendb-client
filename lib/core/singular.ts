import { AxiosInstance } from "axios/dist/axios.min.js"
import Emittery from "emittery"
import Sockette from "sockette"
import cloneDeep from "lodash/cloneDeep"
export default class Singular{
	#http: AxiosInstance
	protected _path: string
	protected _emitter: Emittery
	protected _ticks: number
	
	constructor(path:string,http:AxiosInstance,emitter:Emittery){
		this._path = path
		this.#http = http
		this._emitter = emitter
	}

	async save(){
		let payload = this._prepareData()
		this.#http.post("lenDB",JSON.stringify(payload))
	}

	async load(){
			
	}

	protected _prepareData(): SingularPayload{
		let t = cloneDeep(this)
		delete t._emitter
		delete t._path
		let payload: SingularPayload
		payload.data = t
		payload.path = this._path
		payload.singular = true
		return payload
	}

	on(ev: "update" | "destroy"){
		return this
	}
	
	unsubscribe(){

	}

	async destroy(){

	}
}

export interface SingularPayload{
	path: string
	data: any
	singular: boolean
	operation: "save" | "destroy" | "load"
	ticks?: number
}


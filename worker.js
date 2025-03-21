const {parentPort,isMainThread} = require("worker_threads")

if(!isMainThread){
	parentPort.on("message",(data)=>{
		const n=data.n
		let a=data.start
		const end=data.end
		const skips=data.skips
		let stop=false
		for(;!stop;){
			for(let i=0; i<skips.length; i++){
				a=a+skips[i]
				if(n%a==0n){
					parentPort.postMessage({p:a})
					stop=true
					break
				}
				if(a>=end||a==n){
					parentPort.postMessage({p:1n})
					stop=true
					break

				}
				

			}
			

		}
	})
}

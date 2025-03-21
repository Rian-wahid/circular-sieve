const os = require("os")
const {Worker,isMainThread} = require("worker_threads")

function sqrt(value) {
    if (value < 0n) {
        throw 'square root of negative numbers is not supported'
    }

    if (value < 2n) {
        return value;
    }

    function newtonIteration(n, x0) {
        const x1 = ((n / x0) + x0) >> 1n;
        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0;
        }
        return newtonIteration(n, x1);
    }

    return newtonIteration(value, 1n);

}

async function circularSieve(n){
	let a=sqrt(n)
	if(n%a==0n){
		return a
	}

	let smallPrimes=[2n,3n,5n,7n,11n,13n,17n]
	if(n<2n**24n){
		smallPrimes=[2n,3n,5n,7n]
	}
	if(n>2n**24n&&n<2n**32n){
		smallPrimes=[2n,3n,5n,7n,11n]
	}
	const initMods=[]
	for(let i=0; i<smallPrimes.length; i++){
		initMods.push(a%smallPrimes[i])
	}
	let prevA=a
	let skips=[]
	a=a+1n

	for(;;){
		if(n%a==0n){
			return a
		}
		let isPseudoPrime=true
		let mods=[]
		for(let i=0; i<smallPrimes.length; i++){
			let mod=a%smallPrimes[i]
			mods.push(mod)
			if(mod==0n){
				isPseudoPrime=false
			}
		}
		let isModsEqualInitMods=true
		for(let i=0;i<initMods.length; i++){
			if(mods[i]!=initMods[i]){
				isModsEqualInitMods=false
			}
		}
		if(isModsEqualInitMods){
			skips.push(a-prevA)
			break
		}

		if(isPseudoPrime){
			skips.push(a-prevA)
			prevA=a
		}
		
		a=a+1n
	}
	let cpus=os.cpus().length
	if(cpus==0){
		cpus=3
	}
	if(cpus<=2 || !isMainThread){
		for(;;){
			for(let i=0; i<skips.length; i++){
				a=a+skips[i]
				if(n%a==0n){
					return a
				}
			}
		}
	}else{
		
		let range=0n
		for(let i=0; i<skips.length; i++){
			range=range+skips[i]
		}
		let mul=sqrt(n)/range/BigInt(cpus-1)
		let _mul=10_000n
		if(n<=2n**32n){
			_mul=10n
		}
		if(n>2n**32n&&n<2n**48n){
                        _mul=1000n
		}
		if(mul>_mul){
			range=range*_mul
		}
		if(mul>1n&&mul<=_mul){
			range=range*mul
		}
			
		return await new Promise((res,rej)=>{
			const workers=[]
			let wait=0
			const callWorkers=()=>{
				if(a>=n){
					return
				}
				wait=0
				
				for(let i=0; i<workers.length; i++){
					let end=a+range
					if(end>n){
						end=n
					}
					workers[i].postMessage({n:n,skips:skips,start:a,end:end})
					wait++
					a=end
					if(a>=n){
						break	
					}
				}
			}
			const stopAll=()=>{
				for(let i=0; i<workers.length; i++){
					workers[i].terminate()
					workers[i].unref()
				}
			}
			for(let i=0; i<cpus-1; i++){ 
				workers.push(new Worker("./worker.js"))
				workers[i].on("message",(data)=>{
					wait--
					if(n%data.p==0n&&data.p!=1n){
						stopAll()
						res(data.p)
					}
					
					if(wait<=0){
						if(a>=n){
							stopAll()
							res(1n)
						}else{
							callWorkers()
						}
					}
				})

				workers[i].on("error",()=>{
					rej(new Error("worker error"))
				})
                        }
			callWorkers()
			

		})
	}
}


module.exports=circularSieve

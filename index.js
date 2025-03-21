
const circularSieve=require("./circularSieve.js")

if(process.argv[1]==__filename){

	const p=66949957777n
	const q=20818245893n
	const n=p*q;
	(async ()=>{
		console.info("n      =",n)
		console.info("size n =",n.toString(2).length,"bit")

		console.time("time")
		let f=await circularSieve(n)
		console.timeEnd("time")
		console.info("p      =",f)
		console.info("q      =",n/f)  

		console.assert(f===p)
		console.assert(n/f===q)
	})();

}else{
	module.exports=circularSieve
}

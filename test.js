const circularSieve=require("./index.js");

(async ()=>{
console.assert((await circularSieve(61n*53n))===61n)
console.assert((await circularSieve(1031n*107n))===1031n)
console.assert((await circularSieve(2053n*1031n))===2053n)
})();

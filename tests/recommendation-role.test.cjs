const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
class NextResponse extends Response { static json(body,options){return new NextResponse(JSON.stringify(body),{...options,headers:{'Content-Type':'application/json'}})} }
function route(session,fetchMock){
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync('src/app/api/recommendations/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const requireMock=name=>name==='next-auth'?{getServerSession:async()=>session}:name==='next/server'?{NextResponse}:{authOptions:{}};
 new Function('require','module','exports','fetch',code)(requireMock,module,module.exports,fetchMock);
 return module.exports.POST;
}
test('global teacher with verified LMS student role receives learner recommendations',async()=>{
 const calls=[];
 const post=route({user:{id:7,role:'TEACHER'},accessToken:'synthetic-test-token'},async(url,options)=>{
  calls.push({url,options});return Response.json(calls.length===1?{data:{roles:['TEACHER','ROLE_STUDENT']}}:{items:[],fallback:true});
 });
 const response=await post({json:async()=>({user_id:999,surface:'course_discovery',context:{role:'admin'}})});
 assert.equal(response.status,200);assert.equal(calls.length,2);
 const body=JSON.parse(calls[1].options.body);assert.equal(body.user_id,7);assert.equal(body.context.role,'student');
 assert.match(calls[0].url,/\/api\/v1\/me\/roles$/);
});
test('browser student claim cannot bypass missing LMS role',async()=>{
 let calls=0;
 const post=route({user:{id:7,role:'STUDENT'},accessToken:'synthetic-test-token'},async()=>{calls++;return Response.json({data:{roles:['TEACHER']}})});
 const response=await post({json:async()=>({surface:'course_discovery',context:{role:'student'}})});
 assert.equal(response.status,403);assert.equal(calls,1);
});
test('anonymous recommendation request does not contact services',async()=>{
 const post=route(null,async()=>{throw Error('unexpected fetch')});
 assert.equal((await post({json:async()=>({})})).status,401);
});

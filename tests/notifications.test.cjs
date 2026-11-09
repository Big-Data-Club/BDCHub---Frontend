const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, mocks={}) {
 const mod={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(name=>name in mocks?mocks[name]:require(name),mod,mod.exports);
 return mod.exports;
}
const model=load('src/lib/notifications/model.ts');
const raw=[{course_id:42,node_id:7,alert_type:'concept_struggle',alert_message:'Course ID: 42 Node ID: 7',detected_at:'2026-11-09T00:00:00Z'},
 {course_id:42,alert_type:'inactivity',alert_message:'Course ID: 42',detected_at:'2026-11-09T00:00:00Z'},
 {course_id:99,alert_type:'concept_struggle',alert_message:'private',detected_at:'2026-11-09T00:00:00Z'}];
const courses=[{course_id:42,course_title:'Python căn bản'}];
const targets=[{course_id:42,node_id:7,content_id:71,content_title:'Vòng lặp'}];
test('learning updates and suggestions have distinct categories, including all legacy suggestion types',()=>{
 for(const alert_type of ['course_published','course_updated','section_added','section_updated','content_added','content_updated','quiz_deadline']) assert.equal(model.notificationCategory({alert_type}),'learning');
 for(const alert_type of ['concept_struggle','low_performance','inactivity','positive_reinforcement','ai_suggestion','flashcard_suggestion']) assert.equal(model.notificationCategory({alert_type}),'suggestion');
});
test('suggestions use authorized human names and actual content targets, never raw IDs',()=>{
 const alerts=model.suggestionAlerts(raw,courses,targets,5);
 assert.equal(alerts.length,2);
 assert.ok(alerts.every(alert=>alert.user_id===5&&alert.course_id===42&&alert.alert_message.includes('Python căn bản')&&!alert.alert_message.includes('ID:')));
 assert.equal(alerts.find(a=>a.node_id===7).href,'/lms/student/courses/42/learn?contentId=71');
 assert.equal(alerts.find(a=>a.alert_type==='inactivity').href,'/lms/student/courses/42/learn');
});
test('read identities distinguish different course edits, and targets cannot navigate externally',()=>{
 assert.notEqual(model.notificationKey({id:'learning:1'}),model.notificationKey({id:'learning:2'}));
 assert.equal(model.notificationHref({course_id:42,href:'https://example.test'}),'/lms/student/courses/42/learn');
 assert.equal(model.notificationHref({course_id:42,href:'/lms/\\example.test'}),'/lms/student/courses/42/learn');
});
const next={NextResponse:{json:(body,init)=>Response.json(body,init)}};
const session={user:{id:5},accessToken:'test-token'};
function route(fetcher,currentSession=session){
 return load('src/app/api/ai/agents/notifications/route.ts',{
  'next-auth':{getServerSession:async()=>currentSession},'@/app/api/auth/[...nextauth]/authOptions':{authOptions:{}},
  'next/server':next,'@/lib/notifications/model':model,
 });
}
test('notification BFF makes two bounded requests, scopes by session, and never crawls chapters',async()=>{
 const calls=[];const previous=global.fetch;
 global.fetch=async(url,options)=>{calls.push([url,options]);return Response.json(String(url).includes('/api/v1/notifications')?{alerts:[{id:'learning:9',category:'learning'}],courses,targets,read_keys:['learning:1']}:raw)};
 try{
 const response=await route().GET(new Request('http://localhost/api?user_id=99'));
 const result=await response.json();
 assert.equal(response.status,200);assert.equal(calls.length,2);
 assert.ok(calls.some(([url])=>url.includes('user_id=5')));
 assert.ok(calls.every(([,options])=>options.signal));
 assert.equal(result.alerts.length,3);assert.deepEqual(result.read_keys,['learning:1']);
 }finally{global.fetch=previous}
});
test('BFF refuses unauthorized callers and retains learning alerts if personalization is down',async()=>{
 const previous=global.fetch;let calls=0;
 global.fetch=async(url)=>{calls++;if(String(url).includes('/api/v1/notifications'))return Response.json({alerts:[{id:'learning:1'}],courses,targets});throw Error('offline')};
 try{
 assert.equal((await route(null,null).GET()).status,401);assert.equal(calls,0);
 const response=await route().GET();assert.equal(response.status,200);assert.equal((await response.json()).alerts[0].id,'learning:1');
 }finally{global.fetch=previous}
});
test('LMS permission scope failure does not expose raw personalization alerts',async()=>{
 const previous=global.fetch;global.fetch=async(url)=>Response.json(String(url).includes('/api/v1/notifications')?{error:'offline'}:raw,{status:String(url).includes('/api/v1/notifications')?503:200});
 try{assert.equal((await route().GET()).status,503)}finally{global.fetch=previous}
});
test('bulk additions update unread identity without creating repeated chapter toasts',()=>{
 const first={id:'learning:1',group_key:'content_added:7:123',alert_type:'content_added'};
 const second={...first,id:'learning:2'};
 assert.notEqual(model.notificationKey(first),model.notificationKey(second));
 assert.equal(model.notificationToastKey(first),model.notificationToastKey(second));
 assert.notEqual(model.notificationToastKey({...first,alert_type:'content_updated'}),model.notificationToastKey({...second,alert_type:'content_updated'}));
});
test('rolling deployment legacy alerts never show technical Course ID labels',()=>{
 assert.ok(!model.notificationMessage({alert_type:'inactivity',course_id:42,alert_message:'Quay lại (Course ID: 42)'}).includes('ID'));
});

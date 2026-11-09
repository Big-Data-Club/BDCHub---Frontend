const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const tick = () => new Promise(setImmediate);
function harness() {
 const slots=[];let cursor=0,effects=[],tree;
 let query='contentId=11&notice=learning%3A1',title='Original lesson',requests=0;
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,i)=>Object.is(value,b[i]));
 const memo=(factory,deps)=>{const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={deps,value:factory()};return slots[i].value};
 const hooks={...React,
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value}]},
  useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i]},
  useCallback:(fn,deps)=>memo(()=>fn,deps),useMemo:memo,
  useEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const old=slots[i];slots[i]={deps};effects.push(()=>{old?.cleanup?.();slots[i].cleanup=fn()})}},
 };
 const router={push(url){query=url.split('?')[1]||''},replace(url){query=url.split('?')[1]||''},back(){}};
 const lesson=(sectionId=7)=>({id:sectionId===7?11:12,section_id:sectionId,title,course_id:42,type:'TEXT',metadata:{}});
 const api={getCourse:async()=>({data:{id:42,title:'Python'}}),listSections:async()=>({data:[{id:7,course_id:42},{id:8,course_id:42}]}),getCoTeachers:async()=>[],
  getContent:async()=>{requests++;return{data:lesson()}},listContent:async sectionId=>({data:[lesson(sectionId)]})};
 const Nav=({children})=>children,Prog=Nav,Ui=Nav;
 const contextApi={setPageContext(){},clearPageContext(){}};
 const mocked=name=>{
  if(name==='react')return hooks;
  if(name==='react/jsx-runtime')return require(name);
  if(name.includes('/navigation'))return{useParams:()=>({courseId:'42'}),useRouter:()=>router,usePathname:()=>'/lms/student/courses/42/learn',useSearchParams:()=>new URLSearchParams(query)};
  if(name.includes('lmsService'))return{__esModule:true,default:api};
  if(name.includes('progressService'))return{__esModule:true,default:{getMyCourseProgress:async()=>({completed_content_ids:[]}),getMyCourseProgressDetail:async()=>[]}};
  if(name.includes('usePageContext'))return{useSetPageContext:()=>contextApi};
  if(name==='./StudentCourseContext')return{StudentCourseNavigationContext:{Provider:Nav},StudentCourseProgressContext:{Provider:Prog},StudentCourseUiContext:{Provider:Ui}};
  return{PageLoader:()=>null,AlertCircle:()=>null};
 };
 const code=ts.transpileModule(fs.readFileSync('src/components/lms/student/StudentCourseProviders.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const mod={exports:{}};new Function('require','module','exports',code)(mocked,mod,mod.exports);
 const render=()=>{cursor=0;tree=mod.exports.StudentCourseProviders({children:null});const pending=effects;effects=[];pending.forEach(fn=>fn())};
 return{async settle(){for(let i=0;i<10;i++){render();await tick()}},navigate(value){query=value},setTitle(value){title=value},get content(){return tree?.type===Nav?tree.props.value.activeContent:null},get requests(){return requests},get query(){return query}};
}
test('opening an update for the already-open lesson reloads the latest content',async()=>{
 const app=harness();await app.settle();assert.equal(app.content.title,'Original lesson');
 const before=app.requests;app.setTitle('Updated lesson');app.navigate('contentId=11&notice=learning%3A2');
 await app.settle();assert.equal(app.content.title,'Updated lesson');assert.ok(app.requests>before);
});
test('a chapter notification opens that chapter rather than the first chapter',async()=>{
 const app=harness();await app.settle();app.navigate('sectionId=8&notice=learning%3A3');await app.settle();
 assert.equal(app.content.section_id,8);assert.ok(app.query.includes('contentId=12'));
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const turn = () => new Promise(setImmediate);
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b}); return {promise,resolve,reject}; };
function harness(file, name, api, recommendations) {
  let cursor = 0;
  const slots = [];
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => {slots[i] = typeof value === 'function' ? value(slots[i]) : value;}]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = {current:initial}; return slots[i]; },
    useCallback: fn => fn, useMemo: fn => fn(), useEffect() {},
  };
  const mod = {exports:{}};
  const requireMock = path => path === 'react' ? react : path.includes('lmsService') ? {lmsService:api} : path.includes('analyticsService') ? {analyticsService:{getStudentAnalyticsSummary:async()=>({})}} : path.includes('recommendationService') ? recommendations : {};
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(requireMock, mod, mod.exports);
  return () => {cursor=0;return mod.exports[name]();};
}
const profile = {interested_categories:[], profile_available:false};
const course = (id, title) => ({id,title,enrollment_count:0});

test('discovery renders catalogue while recommendations are still pending and respects backend rank', async () => {
  const ranking = deferred();
  const api = {listPublishedCourses:async()=>({items:[course(1,'A'),course(2,'B')]}), getMyEnrollments:async()=>[]};
  const render = harness('src/hooks/lms/student/useCourseDiscover.ts','useCourseDiscover',api,{
    getLearningPreferenceProfile:async()=>profile, getRecommendations:()=>ranking.promise,
    trackRecommendationEvent:async()=>true,
  });
  const loading = render().loadInitialData();
  await turn();
  assert.equal(render().loading,false);
  assert.equal(render().publishedCourses.length,2);
  ranking.resolve({items:[{entity:{course_id:1},rank:1,score:0.5},{entity:{course_id:2},rank:2,score:0.9}],recommendation_set_id:'r1',fallback:false});
  await loading;
  assert.deepEqual(render().publishedCourses.map(c=>c.id),[1,2]);
});

test('dashboard enrollments render without waiting for preference lookup or ranking', async () => {
  const pending = deferred();
  const render = harness('src/hooks/lms/student/useStudentDashboard.ts','useStudentDashboard',{
    getMyEnrollments:async()=>[{course_id:7,course_title:'Python',progress_percent:30}],
  },{getLearningPreferenceProfile:()=>pending.promise,getRecommendations:async()=>({items:[],recommendation_set_id:'r1'}),trackRecommendationEvent:async()=>true});
  const loading = render().loadAllData();
  await turn();
  assert.equal(render().loadingEnrolled,false);
  assert.equal(render().acceptedEnrollments[0].course_id,7);
  assert.equal(render().selectedCourseId,7);
  pending.resolve(profile);
  await loading;
});

test('recommendation failure leaves discovery catalogue available', async () => {
  const render = harness('src/hooks/lms/student/useCourseDiscover.ts','useCourseDiscover',{
    listPublishedCourses:async()=>({items:[course(1,'A')]}),getMyEnrollments:async()=>[],
  },{getLearningPreferenceProfile:async()=>profile,getRecommendations:async()=>{throw Error('timeout')},trackRecommendationEvent:async()=>true});
  await render().loadInitialData();
  assert.equal(render().publishedCourses.length,1);
  assert.equal(render().loading,false);
  assert.equal(render().recommendationStatus,'unavailable');
});

test('not interested is hidden only after server accepts feedback', async () => {
  let accept = false;
  const render = harness('src/hooks/lms/student/useCourseDiscover.ts','useCourseDiscover',{
    listPublishedCourses:async()=>({items:[course(1,'A'),course(2,'B')]}),getMyEnrollments:async()=>[],
  },{getLearningPreferenceProfile:async()=>profile,getRecommendations:async()=>({items:[{entity:{course_id:1},rank:1,score:0.9}],recommendation_set_id:'r1'}),trackRecommendationEvent:async()=>accept});
  await render().loadInitialData();
  await render().handleRecommendationFeedback(1,'not_interested');
  assert.equal(render().publishedCourses.length,2);
  assert.ok(render().error);
  accept = true;
  await render().handleRecommendationFeedback(1,'not_interested');
  assert.deepEqual(render().publishedCourses.map(c=>c.id),[2]);
});

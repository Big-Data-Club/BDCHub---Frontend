// Browser smoke against a local PRODUCTION Next server, using synthetic auth/API fixtures.
// FARM_SMOKE_SECRET must match that server's dedicated local NEXTAUTH_SECRET.
import { chromium } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const base=process.env.FARM_SMOKE_URL||'http://localhost:3217';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Only run against a local test server');
const secret=process.env.FARM_SMOKE_SECRET;
assert(secret,'Set a dedicated local FARM_SMOKE_SECRET');
const catalog=JSON.parse(fs.readFileSync(fileURLToPath(new URL('../../../farm-service/internal/farm/catalog.json',import.meta.url)),'utf8'));
const makeEntity=(id,kind,x,y,ready=0)=>({id,kind,x,y,ready,category:kind==='chicken'?'ANIMAL':'CROP',progress:ready?1:0,hungerPct:100,waterPct:0,regrowLeft:0,needsRewater:false,health:100,sick:false,oxygen:100,buildLeft:0,housed:true,hasOxygen:true,contained:false,flowerNearby:true,realLinked:false,refundCoins:0,onAquaponics:false,aquaActive:false,aquaOxygen:100,oxygenLeft:1000,habitatOxygen:100,habitatBuildLeft:0});
const world={farm:{id:'test-farm',name:'Nông trại kiến thức',coins:900,xp:0,level:1},life:{hungerPct:100,insects:1,catchCooldown:0},entities:[makeEntity('rice','rice_crop',6,5,1),makeEntity('flower','flower',8,6),makeEntity('chicken','chicken',10,5,1)],wildInsects:[{id:'bug',species:'butterfly',x:15,y:8}],inventory:{paddy:3,rice:2,oxygen:1},catalog:{rice_crop:{label:'Lúa nước',category:'CROP',price:18,seconds:120,description:'Lúa lấy thóc'},water_spinach:{label:'Rau muống',category:'CROP',price:16,seconds:100,description:'Rau cho cá'},flower:{label:'Hoa dại',category:'CROP',price:26,seconds:95,description:'Hoa cho ong'},chicken:{label:'Gà thả vườn',category:'ANIMAL',price:115,seconds:360,description:'Gà ăn thóc'},tank:{label:'Thùng nuôi',category:'STRUCTURE',price:85,seconds:45,description:'Thùng 4×2'},fence:{label:'Hàng rào',category:'DECOR',price:14,description:'Trang trí'}},labels:{paddy:'Thóc',rice:'Gạo',egg:'Trứng gà',oxygen:'Bình oxy'},sellPrices:{paddy:12,rice:35,egg:76},shopSupplies:{rice:45,oxygen:55},history:[],grid:{width:20,height:14},serverTime:new Date().toISOString()};
let earned=0;const actions=[];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext();
 const session=await encode({secret,token:{sub:'41',name:'Farm UI Test',email:'farm-ui@example.invalid',role:'ROLE_USER',accessToken:'synthetic-ui-token',accessTokenExpires:Date.now()+3600000},maxAge:3600});
 await context.addCookies([{name:'__Secure-bdc.session-token.v2',value:session,domain:new URL(base).hostname,path:'/',secure:true,httpOnly:true,sameSite:'Lax'}]);
 const page=await context.newPage();const errors=[],assetFailures=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
 page.on('response',response=>{if(response.url().includes('/knowledge-farm/sprites/')&&!response.ok())assetFailures.push(response.url())});
 await page.route('**/apiv1/**',route=>route.fulfill({json:route.request().url().includes('/users/41')?{id:41,name:'Farm UI Test',email:'farm-ui@example.invalid',role:'ROLE_USER',totalScore:100+earned}:[]}));
 await page.route('**/lmsapiv1/**',route=>route.fulfill({json:{data:[]}}));
 await page.route('**/api/ai/agents/notifications',route=>route.fulfill({json:{notifications:[]}}));
 await page.route('**/api/farm{,/**}',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/score'))return route.fulfill({json:{total_score:100+earned}});
  if(path.endsWith('/game/state'))return route.fulfill({json:world});
  if(path.endsWith('/game/challenge')){
   const body=route.request().postDataJSON();actions.push({path,...body});
   return route.fulfill({json:{id:'challenge-'+earned,expires_at:new Date(Date.now()+600000).toISOString(),question:body.kind==='quiz'?{id:'q',kind:'quiz',prompt:'Lúa tạo sản phẩm nào?',options:['Thóc','Trứng']}:{id:'f',kind:'flashcard',prompt:'Gà mái đẻ sản phẩm gì?'}}});
  }
  if(path.includes('/game/')){
   const body=route.request().postDataJSON();actions.push({path,...body});
   if(path.endsWith('/action')&&body.action==='HARVEST'){
    assert(body.challenge_id,'harvest bypassed learning');
    world.entities.find(e=>e.id===body.entityId).ready=0;
    earned+=5;world.inventory[body.entityId==='rice'?'paddy':'egg']=(world.inventory[body.entityId==='rice'?'paddy':'egg']||0)+(body.entityId==='rice'?3:1);
    return route.fulfill({json:{correct:true,awarded:5,explanation:'Bạn đã học thêm một điều.',event_id:'test-'+earned}});
   }
   if(path.endsWith('/place'))world.entities.push(makeEntity('placed',body.kind,body.x,body.y));
   return route.fulfill({json:{message:'Đã thực hiện hành động'}});
  }
  return route.fulfill({json:{state:{earned,daily_earned:earned,reward_day:'2026-10-17',plots:[]},catalog,server_time:new Date().toISOString(),pending_events:0,daily_limit:100,reward:5}});
 });
 await page.setViewportSize({width:1440,height:1100});
 await page.goto(`${base}/knowledge-farm`,{waitUntil:'networkidle'});
 try{await page.getByRole('heading',{name:'Nông trại kiến thức',exact:true}).waitFor();}
 catch(error){console.error('Smoke location:',page.url(),'Body:',(await page.locator('body').innerText()).slice(0,500),'Page errors:',errors);throw error}
 const canvas=page.locator('.eco-stage canvas');await canvas.waitFor();
 // Verify the production server serves every texture the copied scene needs.
 const sprites=fs.readdirSync(fileURLToPath(new URL('../../public/knowledge-farm/sprites',import.meta.url))).filter(name=>name.endsWith('.png'));
 for(const file of sprites){const res=await context.request.get(`${base}/knowledge-farm/sprites/${file}`);assert.equal(res.status(),200,file);assert((await res.body()).length>50,file)}
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.eco img')).every(img=>img.complete&&img.naturalWidth>0));
 const tile=async(x,y)=>{const box=await canvas.boundingBox();assert(box);await canvas.click({position:{x:(x+.5)*box.width/20,y:(y+.5)*box.height/14}})};
 await tile(6,5);
 await page.getByRole('heading',{name:'Ngoài đời thực',exact:true}).waitFor();
 await page.locator('.eco-shortcuts-actions').getByRole('button',{name:/Thu hoạch/}).click();
 await page.getByRole('radio',{name:'Thóc'}).check();
 await page.getByRole('dialog').getByRole('button',{name:'Trả lời để thu hoạch'}).click();
 await page.getByRole('status').filter({hasText:'Thu hoạch thành công! +5 điểm'}).waitFor();
 await page.waitForFunction(()=>!document.querySelector('.eco-touch-controls button')?.hasAttribute('disabled'));
 assert.equal(earned,5);assert.equal(world.inventory.paddy,6);
 await page.getByRole('combobox',{name:'Cách học khi thu hoạch'}).selectOption('flashcard');
 await tile(10,5);
 try{await page.locator('.eco-selected h3').filter({hasText:'Gà thả vườn'}).waitFor({timeout:2000});}
 catch{await tile(10,5);await page.locator('.eco-selected h3').filter({hasText:'Gà thả vườn'}).waitFor()}
 await page.locator('.eco-shortcuts-actions').getByRole('button',{name:/Nhặt trứng/}).click();
 await page.getByRole('textbox',{name:'Câu trả lời của bạn'}).fill('trứng');
 await page.getByRole('dialog').getByRole('button',{name:'Trả lời để thu hoạch'}).click();
 await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(earned,10);
 await page.locator('.eco-product').filter({hasText:'Rau muống'}).click();
 await tile(12,11);
 await page.waitForFunction(()=>!document.querySelector('.eco-build-hint'));
 assert(actions.some(a=>a.path.endsWith('/place')&&a.kind==='water_spinach'&&a.x===12&&a.y===11));
 await tile(8,6);await page.locator('.eco-stage').focus();await page.keyboard.press('Digit1');
 await page.waitForTimeout(250);assert(actions.some(a=>a.action==='WATER'&&a.entityId==='flower'));
 await page.locator('.eco-stage').focus();await page.keyboard.press('KeyD');
 await page.screenshot({path:'/tmp/knowledge-farm-game-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Phải',exact:true}).click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'mobile overflow');
 await page.screenshot({path:'/tmp/knowledge-farm-game-mobile.png',fullPage:true});
 assert.deepEqual(assetFailures,[]);assert.deepEqual(errors,[]);
 console.log('PASS: Phaser canvas, all production sprites, quiz/flashcard harvest, shop placement, keyboard care, mobile controls');
}finally{await browser.close()}

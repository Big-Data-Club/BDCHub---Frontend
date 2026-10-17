/* eslint-disable @next/next/no-img-element -- fixed-size pixel sprites from the original game */
'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {Trash2,ArrowLeftRight,Bug,Check,ChevronRight,Coins,Heart,Leaf,RefreshCw,ShoppingBasket,Utensils,Warehouse,X} from 'lucide-react';
import {api,post} from '../lib/api';
import {formatSecs,sprite,entityFootprint,WATER_HABITAT_CAPACITY} from '../lib/economy';
import {getEntityShortcuts,nudgeMovePreview,shouldIgnoreFarmShortcut} from '../lib/farmShortcuts';
import type {FarmShortcut} from '../lib/farmShortcuts';
import type {EcoCatalogEntry,EcoEntity,EcoWorld} from '../lib/economy';
import type {Challenge, AnswerResult, Species, LearningMode} from '../types';
import {HarvestDialog} from './HarvestDialog';
import {SpeciesGuide} from './SpeciesGuide';
import '../game/eco.css';
type ViewProps={flash:(message:string)=>void;fail:(error:unknown)=>void;catalogInfo:Species[];onReward:()=>void};
import SellControls from './SellControls';

const EcoGame=dynamic(()=>import('../game/EcoGame'),{ssr:false});
type Mode={type:'place';kind:string}|{type:'move';id:string}|null;
type Tab='CROP'|'ANIMAL'|'STRUCTURE'|'DECOR';
const TABS:{key:Tab;label:string;symbol:string}[]=[
  {key:'CROP',label:'Trồng cây',symbol:'🌾'},
  {key:'ANIMAL',label:'Vật nuôi',symbol:'🐓'},
  {key:'STRUCTURE',label:'Xây dựng',symbol:'🏠'},
  {key:'DECOR',label:'Trang trí',symbol:'🌼'},
];
const symbols:Record<string,string>={paddy:'🌾',meal:'🍚',aid_rice:'🍚',medicine:'💊',oxygen:'🫧',fish_feed:'🐟',frog_feed:'🪱',chicken_product:'🍗',fish_product:'🐟',frog_product:'🐸',mustard:'🥬'};
const pixelKinds=new Set(['rice_crop','water_spinach','mustard','flower','chicken','frog','bee','fish','farmer','fence','tank','pond','hive','aquaponics','bench','flowerpot','egg','honey','rice','insect']);
function Pix({kind,size=50}:{kind:string;size?:number}){
  return <span className="eco-pix" style={{width:size,height:size}}>
    {pixelKinds.has(kind)?<img src={sprite(kind)} width={size} height={size} alt=""/>:<span className="eco-fallback" aria-hidden="true">{symbols[kind]||'🍀'}</span>}
  </span>;
}
function nextActionForSupply(kind:string,picked:EcoEntity|undefined):{action:string;item?:string}|null{
  if(kind==='paddy'&&picked?.kind==='chicken')return {action:'FEED',item:kind};
  if(['insect','frog_feed'].includes(kind)&&picked?.kind==='frog')return {action:'FEED',item:kind};
  if(['water_spinach','fish_feed'].includes(kind)&&picked?.kind==='fish')return {action:'FEED',item:kind};
  if(kind==='medicine'&&picked?.category==='ANIMAL')return {action:'MEDICINE'};
  if(kind==='oxygen'&&['pond','tank','aquaponics'].includes(picked?.kind||''))return {action:'OXYGEN'};
  return null;
}
function stateText(o:EcoEntity):string{
  if(o.buildLeft>0)return `Đang xây · ${formatSecs(o.buildLeft)}`;
  if(o.sick)return 'Cần chữa bệnh';
  if(o.category==='CROP'&&o.onAquaponics&&!o.aquaActive)return 'Giàn thiếu oxy · cây tạm dừng';
  if(o.category==='CROP'&&o.onAquaponics&&o.regrowLeft>0)return `Cây tái sinh sau ${formatSecs(o.regrowLeft)}`;
  if(o.category==='CROP')return o.ready>0?'Sẵn sàng thu hoạch':o.regrowLeft>0?`Đang nghỉ · ${formatSecs(o.regrowLeft)}`:o.needsRewater?'Tưới lại để cây lớn tiếp':o.waterPct===0?'Cần tưới nước':'Đang lớn';
  if(o.category==='ANIMAL'){
    if(o.kind==='fish'||o.kind==='frog'){
      if(o.habitatBuildLeft>0)return `Ao/thùng đang xây · ${formatSecs(o.habitatBuildLeft)}`;
      if(!o.housed)return 'Chưa nằm trong ao/thùng';
      if(!o.hasOxygen)return `Ao/thùng còn ${o.habitatOxygen}% oxy · Cần bơm`;
    }
    if(o.kind==='bee'&&!o.flowerNearby)return 'Cần hoa đang nở';
    return o.ready>0?'Có thể thu hoạch':o.hungerPct===0?'Đang đói · Tạm dừng':'Đang phát triển';
  }
  if(o.category==='STRUCTURE'&&['pond','tank','aquaponics'].includes(o.kind)&&o.oxygen<=15)return 'Thiếu oxy · sản xuất tạm dừng';
  return 'Sẵn sàng';
}

export default function PlayerView({flash,fail,catalogInfo,onReward}:ViewProps){
  const [learningMode,setLearningMode]=useState<LearningMode>('quiz');
  const [lesson,setLesson]=useState<{challenge:Challenge;entityId:string;action:string}|null>(null);
  const [lessonError,setLessonError]=useState('');
  const [now,setNow]=useState(Date.now());
  const actionLock=useRef(false), requestVersion=useRef(0);
  const [world,setWorld]=useState<EcoWorld|null>(null);
  const [mode,setMode]=useState<Mode>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [movePreview,setMovePreview]=useState<{x:number;y:number}|null>(null);
  const [tab,setTab]=useState<Tab>('CROP');
  const [busy,setBusy]=useState(false);
  const [rename,setRename]=useState(false);
  const [farmName,setFarmName]=useState('');
  const load=useCallback(async()=>{
    const version=++requestVersion.current;
    const data=await api<EcoWorld>('/game/state');
    if(version!==requestVersion.current)return data;
    setWorld(data);setFarmName(prev=>prev||data.farm.name);
    return data;
  },[]);
  useEffect(()=>{
    const versionRef=requestVersion;
    load().catch(fail);
    const timer=setInterval(()=>{if(!document.hidden&&!actionLock.current)load().catch(()=>{});},5000);
    const tick=setInterval(()=>setNow(Date.now()),1000);
    return ()=>{clearInterval(timer);clearInterval(tick);++versionRef.current;};
  },[load,fail]);
  const entities=world?.entities||[];
  const picked=entities.find(e=>e.id===selected);
  const pickedCatalog=picked&&world?.catalog[picked.kind];
  const shortcuts=getEntityShortcuts(picked);
  const infoKind=picked?.kind;
  const info=catalogInfo.find(item=>item.kind===infoKind);
  const beginHarvest=async(name:string)=>{
    if(!picked||actionLock.current)return;
    actionLock.current=true;setBusy(true);++requestVersion.current;setLessonError('');
    try{
      const challenge=await post<Challenge>('/game/challenge',{entityId:picked.id,action:name,kind:learningMode});
      setLesson({challenge,entityId:picked.id,action:name});
    }catch(error){fail(error);}finally{actionLock.current=false;setBusy(false);}
  };
  const answerHarvest=async(answer:string)=>{
    if(!lesson||actionLock.current)return;
    actionLock.current=true;setBusy(true);++requestVersion.current;setLessonError('');
    try{
      const result=await post<AnswerResult>('/game/action',{entityId:lesson.entityId,action:lesson.action,challenge_id:lesson.challenge.id,answer});
      setLesson(null);
      flash(result.correct?`Thu hoạch thành công! +${result.awarded} điểm. ${result.explanation}`:`Chưa đúng. ${result.explanation}`);
      await load();onReward();
    }catch(error){setLessonError(error instanceof Error?error.message:'Không thể kiểm tra câu trả lời.');}
    finally{actionLock.current=false;setBusy(false);}
  };
  const catalog=useMemo(()=>Object.entries(world?.catalog||{}).filter(([,v])=>v.category===tab),[world,tab]);
  const inv=(item:string)=>world?.inventory[item]||0;
  const submit=async(path:string,body:object={}):Promise<boolean>=>{
    if(actionLock.current)return false;
    actionLock.current=true;++requestVersion.current;setBusy(true);
    try{
      const result=await post<{message:string}>(path,body);
      flash(result.message);await load();return true;
    }catch(error){fail(error);return false;}
    finally{actionLock.current=false;setBusy(false);}
  };
  const onTile=(x:number,y:number)=>{
    if(!world||busy)return;
    if(world.life.hungerPct===0&&mode){flash('Nông dân cần ăn cơm để làm tiếp!');setMode(null);return;}
    if(mode?.type==='place'){
      void (async()=>{if(await submit('/game/place',{kind:mode.kind,x,y}))setMode(null);})();return;
    }
    if(mode?.type==='move'){
      // Clicking a new location previews it, just like arrow keys. Enter commits.
      setMovePreview({x,y});return;
    }
    const bug=world.wildInsects?.find(b=>b.x===x&&b.y===y);
    if(bug){if(world.life.hungerPct===0){flash('Nông dân cần ăn cơm để bắt côn trùng!');return;}void submit('/game/catch',{insectId:bug.id});return;}
    // A fish/frog belongs to its water tile: choose the animal before the habitat.
    const hit=entities.filter(e=>{const {width,height}=entityFootprint(e.kind);return x>=e.x&&x<e.x+width&&y>=e.y&&y<e.y+height;});
    const target=hit.find(e=>e.category==='ANIMAL')||hit.find(e=>e.category==='CROP')||hit[hit.length-1];
    setSelected(target?.id||null);
  };
  const removeSelected=()=>{
    if(!picked||busy)return;
    const label=world?.catalog[picked.kind]?.label||picked.kind;
    if(!window.confirm(`Gỡ ${label} khỏi nông trại?\nHoàn ${picked.refundCoins} Xu Lá.\nCây/con vật sẽ mất, nông sản đã thu hoạch trong kho vẫn giữ.`))return;
    void (async()=>{if(await submit('/game/remove',{entityId:picked.id})){setSelected(null);setMode(null);setMovePreview(null);}})();
  };
  const action=(name:string,item?:string)=>{
    if(!picked)return;
    if(name==='HARVEST'||name==='SELL_CHICKEN'){void beginHarvest(name);return;}
    if(world?.life.hungerPct===0){flash('Nông dân cần ăn cơm để làm tiếp!');return;}
    void (async()=>{
      if(await submit('/game/action',{entityId:picked.id,action:name,...(item?{item}:{})})){
        if(name==='SELL_CHICKEN'||(name==='HARVEST'&&['frog','fish'].includes(picked.kind)))setSelected(null);
      }
    })();
  };
  const startMove=()=>{
    if(!picked){flash('Chọn một vật thể trước khi di chuyển.');return;}
    if(world?.life.hungerPct===0){flash('Nông dân cần ăn cơm để làm tiếp!');return;}
    if(busy)return;
    if(mode?.type!=='move'||mode.id!==picked.id)setMovePreview({x:picked.x,y:picked.y});
    setMode({type:'move',id:picked.id});
  };
  const confirmMove=()=>{
    if(busy||mode?.type!=='move'||!movePreview)return;
    const {id}=mode;
    const {x,y}=movePreview;
    if(picked && picked.x===x && picked.y===y){setMode(null);setMovePreview(null);return;}
    void (async()=>{if(await submit('/game/move',{entityId:id,x,y})){setMode(null);setMovePreview(null);}})();
  };
  const triggerShortcut=(shortcut:FarmShortcut)=>{
    if(busy)return;
    if(world?.life.hungerPct===0){flash('Nông dân cần ăn cơm để làm tiếp!');return;}
    if(!shortcut.enabled){flash(shortcut.reason||'Thao tác chưa khả dụng.');return;}
    if(shortcut.command==='OXYGEN_HABITAT'){
      if(picked?.habitatId)void submit('/game/action',{entityId:picked.habitatId,action:'OXYGEN'});
      return;
    }
    action(shortcut.command);
  };
  // Capture digits only while playing. Input fields (including SellControls), browser
  // shortcuts and text editors must behave normally. Do not move by API per arrow:
  // arrows only update the preview; Enter commits one authoritative Go transaction.
  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{
      if(lesson||shouldIgnoreFarmShortcut(event.target,event.ctrlKey,event.altKey,event.metaKey))return;
      const isArrow=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key);
      if(mode?.type==='move' && isArrow){
        event.preventDefault();
        if(busy||!picked)return;
        setMovePreview(previous=>nudgeMovePreview(previous||{x:picked.x,y:picked.y},
          event.key as 'ArrowLeft'|'ArrowRight'|'ArrowUp'|'ArrowDown',entityFootprint(picked.kind),world?.grid||{width:20,height:14}));
        return;
      }
      if(event.repeat)return;
      if(event.key==='Escape'){
        if(mode||selected){event.preventDefault();setMode(null);setMovePreview(null);if(!mode)setSelected(null);}
        return;
      }
      if(mode?.type==='move' && event.key==='Enter'){
        event.preventDefault();confirmMove();return;
      }
      if(event.key==='0'||event.code==='Numpad0'){
        event.preventDefault();startMove();return;
      }
      if((event.key==='Delete'||event.key==='Backspace')&&picked){
        event.preventDefault();
        if(busy)return;
        removeSelected();return;
      }
      if(mode?.type==='move'||mode?.type==='place')return;
      const key=event.code.startsWith('Numpad')?event.code.slice(6):event.key;
      const match=shortcuts.find(shortcut=>shortcut.key===key);
      if(match){event.preventDefault();triggerShortcut(match);}
    };
    window.addEventListener('keydown',onKeyDown);
    return()=>window.removeEventListener('keydown',onKeyDown);
  });
  const selectPlace=(kind:string)=>{if(world?.life.hungerPct===0){flash('Nông dân cần ăn cơm để làm tiếp!');return;}setMode({type:'place',kind});setMovePreview(null);setSelected(null);};
  const supplyAction=(kind:string)=>{
    if(kind==='meal'){void submit('/game/eat');return;}
    if(kind==='rice'||kind==='aid_rice'){void submit('/game/craft',{recipe:'cook_meal',quantity:1});return;}
    // Players may pump their frog/fish habitat directly without searching for
    // an empty water tile to select underneath the animals.
    if(kind==='oxygen'&&picked&&['fish','frog'].includes(picked.kind)&&picked.habitatId){
      void submit('/game/action',{entityId:picked.habitatId,action:'OXYGEN'});
      return;
    }
    const actionInfo=nextActionForSupply(kind,picked);
    if(actionInfo){action(actionInfo.action,actionInfo.item);return;}
    const hints:Record<string,string>={paddy:'Chọn một con gà trên bản đồ trước nhé!',insect:'Chọn ếch để cho ăn.',frog_feed:'Chọn ếch để cho ăn.',water_spinach:'Chọn cá để cho ăn.',fish_feed:'Chọn cá để cho ăn.',oxygen:'Chọn ao, thùng hoặc giàn aquaponics.',medicine:'Chọn vật nuôi bị bệnh.'};
    flash(hints[kind]||'Vật phẩm này dùng để bán hoặc chế biến.');
  };
  if(!world)return <div className="eco-loader"><span className="eco-pixel-loader">🌱</span><h2>Đang mở khu vườn...</h2></div>;
  const harvestable=entities.filter(e=>e.ready>0).length;
  const needCare=entities.filter(e=>e.category==='ANIMAL'&&(e.hungerPct===0||e.sick)).length;
  const stock=Object.entries(world.inventory).filter(([,amount])=>amount>0).sort(([a],[b])=>a.localeCompare(b));
  const hungry=world.life.hungerPct===0;
  const canMill=inv('paddy')>=2;
  const canCook=inv('rice')+inv('aid_rice')>0;
  const recover=()=>{
    if(inv('meal')>0){void submit('/game/eat');return;}
    if(canCook){void submit('/game/craft',{recipe:'cook_meal',quantity:1});return;}
    if(canMill){void submit('/game/craft',{recipe:'mill_rice',quantity:1});return;}
    if(world.farm.coins>=world.shopSupplies.rice){void submit('/game/shop',{kind:'rice',quantity:1});return;}
    if(hungry){void submit('/game/aid');}
    else flash('Hãy trồng thêm lúa hoặc mua gạo để dự trữ nhé!');
  };
  const recoverLabel=inv('meal')>0?'Ăn cơm':canCook?'Nấu cơm':canMill?'Xay gạo':world.farm.coins>=world.shopSupplies.rice?'Mua gạo':hungry?'Xin gạo cứu trợ':'Hết gạo';

  return <div className="eco eco-v4">
    <header className="eco-titlebar">
      <div><div className="eco-kicker">🌿 NÔNG TRẠI KIẾN THỨC</div><h1>{world.farm.name}</h1><p>Chơi nông trại, học một điều mới mỗi lần thu hoạch!</p></div>
      <div className="eco-wallet"><div><span>⭐ Cấp {world.farm.level}</span><strong>{world.farm.xp.toLocaleString('vi-VN')} XP</strong></div><div><span><Coins size={18}/> Xu Lá</span><strong>{world.farm.coins.toLocaleString('vi-VN')}</strong></div></div>
    </header>
    <div className="eco-learning-bar"><label>Câu hỏi thu hoạch <select aria-label="Cách học khi thu hoạch" value={learningMode} disabled={busy||!!lesson} onChange={event=>setLearningMode(event.target.value as LearningMode)}><option value="quiz">Quiz · chọn đáp án</option><option value="flashcard">Flashcard · nhớ và trả lời</option></select></label><span>Xu Lá / XP dùng trong game. Câu trả lời đúng cộng điểm học vào tài khoản.</span></div>
    <div className="eco-farmbar">
      <div className="eco-farmer"><Pix kind="farmer" size={48}/><div><strong>Nông dân</strong><div className="eco-meter"><i style={{width:`${world.life.hungerPct}%`}}/></div><small>{hungry?'Đang đói — cần ăn cơm!':'Năng lượng '+world.life.hungerPct+'%'}</small></div><button className="eco-quiet" disabled={busy||(inv('meal')>0&&world.life.hungerPct>75)||(!hungry&&!canCook&&!canMill&&inv('meal')===0&&world.farm.coins<world.shopSupplies.rice)} onClick={recover}><Utensils size={17}/> {recoverLabel}</button></div>
      <div className="eco-badges"><span>🥚 {harvestable} sẵn sàng</span><span className={needCare?'eco-urgent':''}>❤️ {needCare} cần chăm</span></div>
      <div className="eco-actions"><button disabled={!world.life.insects} onClick={()=>document.querySelector('.eco-game-card')?.scrollIntoView({behavior:'smooth',block:'center'})}><Bug size={18}/> Tìm côn trùng <b>{world.life.insects}</b></button><button title="Làm mới" onClick={()=>void load().catch(fail)}><RefreshCw size={18}/></button><button title="Đổi tên" onClick={()=>setRename(v=>!v)}>✏️</button></div>
    </div>
    {hungry&&<div className="eco-hungry-banner" role="alert">
      <span className="eco-hungry-illustration">🍚</span>
      <div><strong>Nông dân đang đói!</strong><p>Cần ăn cơm trước khi xây dựng, chăm sóc, thu hoạch hoặc bán hàng.</p></div>
      <button onClick={recover} disabled={busy}>{recoverLabel} <ChevronRight size={19}/></button>
    </div>}
    {rename&&<div className="eco-rename"><input value={farmName} maxLength={90} aria-label="Tên nông trại" onChange={e=>setFarmName(e.target.value)}/><button onClick={()=>{void submit('/game/rename',{name:farmName});setRename(false);}}>Đổi tên</button></div>}
    <div className="eco-top-grid">
      <section className="eco-game-card">
        <div className="eco-game-heading"><h2>🌳 Khu vườn của bạn</h2><span>{mode?.type==='move'?'↔ Đang di chuyển':mode?.type==='place'?'🛠 Đang xây dựng':harvestable?'✨ Có nông sản mới':'🍃 Một ngày đẹp trời'}</span></div>
        <div className="eco-shortcuts" aria-label="Phím tắt thao tác trong nông trại">
          <div className="eco-shortcuts-heading"><strong>⌨️ Phím tắt</strong><small>{pickedCatalog?.label||'Chọn một vật thể trên bản đồ'}</small></div>
          <div className="eco-shortcuts-actions">
            {shortcuts.map(shortcut=><button key={shortcut.key} type="button" disabled={busy||hungry||!shortcut.enabled||Boolean(mode)} title={shortcut.reason} onClick={()=>triggerShortcut(shortcut)}><kbd>{shortcut.key}</kbd>{shortcut.label}</button>)}
            <button type="button" disabled={busy||hungry||!picked} className={mode?.type==='move'?'active':''} onClick={startMove}><kbd>0</kbd>Di chuyển</button>
            <button type="button" disabled={busy||hungry||!picked} className="eco-shortcuts-remove" onClick={removeSelected}><kbd>Del</kbd>Gỡ bỏ</button>
          </div>
        </div>
        <div className="eco-game-frame"><EcoGame entities={entities} catalog={world.catalog} selected={selected} mode={mode} movePreview={mode?.type==='move'?movePreview:null} insects={world.wildInsects||[]} onTile={onTile} disabled={busy||!!lesson}/>
          {mode&&<div className="eco-build-hint">
            <span>{mode.type==='place'?`👆 Chọn nơi đặt ${world.catalog[mode.kind]?.label||mode.kind}`:`↔ Dùng ↑ ↓ ← → · ô ${movePreview?`(${movePreview.x+1}, ${movePreview.y+1})`:''}`}</span>
            {mode.type==='move'&&<button className="eco-confirm-move" disabled={busy} onClick={confirmMove}><Check size={16}/> Enter · Đặt</button>}
            <button onClick={()=>{setMode(null);setMovePreview(null);}}><X size={18}/> Esc · Hủy</button>
          </div>}
        </div>
        <footer className="eco-map-footer"><span>WASD: nông dân</span><span>0 + phím mũi tên: dời vật thể · Enter xác nhận</span><span>1–4: thao tác · Del: gỡ bỏ</span></footer>
      </section>
      <aside className="eco-sidepanel">
        <section className="eco-panel eco-inspector">
          <div className="eco-panel-head"><h2>🪴 Chăm sóc</h2>{picked&&<button className="eco-close" title="Bỏ chọn" onClick={()=>setSelected(null)}><X size={17}/></button>}</div>
          {!picked||!pickedCatalog?<div className="eco-empty"><Pix kind="chicken" size={75}/><strong>Chọn cây hoặc con vật</strong><p>Nhấn lên khu vườn để chăm sóc, cho ăn hoặc thu hoạch.</p></div>:<div className="eco-detail">
            <div className="eco-selected"><Pix kind={picked.kind} size={72}/><div><h3>{pickedCatalog.label}</h3><span className={'eco-status '+((picked.sick||picked.hungerPct===0&&picked.category==='ANIMAL')?'eco-status-warn':'')}>{stateText(picked)}</span></div></div>
            {['CROP','ANIMAL'].includes(picked.category)&&<div className="eco-progress-wrap"><div className="eco-stat-label"><span>Tiến trình</span><strong>{Math.round(picked.progress*100)}%</strong></div><div className="eco-progress"><i style={{width:`${picked.progress*100}%`}}/></div></div>}
            {picked.category==='ANIMAL'&&<div className="eco-chips"><span className={picked.hungerPct<=33?'warning':''}>🍚 No {picked.hungerPct}%</span><span className={picked.sick?'danger':''}>❤️ Khỏe {picked.health}%</span>{picked.kind==='chicken'&&<span>🚧 {picked.contained?'Có rào':'Thả rong'}</span>}{['fish','frog'].includes(picked.kind)&&<><span>💧 {picked.housed?'Có ao/thùng':'Cần ao/thùng'}</span>{picked.habitatId&&<span className={picked.hasOxygen?'':'warning'}>🫧 Oxy {picked.habitatOxygen}%</span>}</>}{picked.kind==='bee'&&<span>🌼 {picked.flowerNearby?'Có hoa':'Thiếu hoa'}</span>}</div>}
            {picked.category==='CROP'&&<div className="eco-chips"><span>{picked.onAquaponics?picked.aquaActive?'💧 Tự tưới · oxy tốt':'🫧 Giàn cần bơm oxy':`💧 Đất ẩm ${picked.waterPct}%`}</span>{picked.needsRewater&&<span>{picked.regrowLeft>0?`🌱 Nghỉ ${formatSecs(picked.regrowLeft)}`:'🌱 Sẵn sàng tưới lại'}</span>}</div>}
            {picked.category==='STRUCTURE'&&<div className="eco-chips"><span>🔨 {picked.buildLeft>0?formatSecs(picked.buildLeft):'Đã hoàn thành'}</span>{['tank','pond'].includes(picked.kind)&&<span>🐟 Đang nuôi {entities.filter(a=>['fish','frog'].includes(a.kind)&&a.x>=picked.x&&a.x<picked.x+4&&a.y>=picked.y&&a.y<picked.y+2).length}/{WATER_HABITAT_CAPACITY}</span>}{['tank','pond','aquaponics'].includes(picked.kind)&&<span className={picked.oxygen<=35?'warning':''}>🫧 Oxy {picked.oxygen}% · {picked.oxygenLeft>0?`còn ${formatSecs(picked.oxygenLeft)}`:'Cần bơm ngay'}</span>}</div>}
            <div className="eco-detail-actions">
              {shortcuts.map(shortcut=><button key={shortcut.key} type="button"
                className={shortcut.command==='HARVEST'?'eco-green':''}
                disabled={busy||hungry||!shortcut.enabled||Boolean(mode)}
                title={shortcut.reason} onClick={()=>triggerShortcut(shortcut)}>
                <kbd>{shortcut.key}</kbd> {shortcut.label}
              </button>)}
              <button disabled={busy||hungry} className="eco-secondary" onClick={startMove}><kbd>0</kbd><ArrowLeftRight size={17}/> Di chuyển</button>
              <button disabled={busy||hungry} className="eco-remove" onClick={removeSelected} title="Tháo bỏ cây, vật nuôi hoặc công trình đặt sai"><kbd>Del</kbd><Trash2 size={17}/> Gỡ bỏ · hoàn {picked.refundCoins} xu</button>
            </div>
            {info&&<SpeciesGuide species={info}/>}
          </div>}
        </section>
        <section className="eco-panel eco-shop"><div className="eco-panel-head"><h2><ShoppingBasket size={20}/> Cửa hàng</h2><span className="eco-count">{catalog.length} món</span></div>
          <div className="eco-category-tabs">{TABS.map(t=><button key={t.key} className={tab===t.key?'active':''} onClick={()=>setTab(t.key)}><b>{t.symbol}</b><span>{t.label}</span></button>)}</div>
          {tab==='STRUCTURE'&&<div className="eco-tip">🫧 Ao, thùng và giàn aquaponics cần nạp oxy định kỳ. Giàn <b>5×3 ô</b> tự cấp nước cho cây trồng bên trên.</div>}
          {tab==='ANIMAL'&&<div className="eco-tip">🐟 Nuôi cá, ếch: xây <b>ao hoặc thùng</b> trước rồi chọn một ô nước.</div>}
          <div className="eco-product-grid">{catalog.map(([key,good]:[string,EcoCatalogEntry])=><button disabled={busy||hungry} className={'eco-product '+(mode?.type==='place'&&mode.kind===key?'chosen':'')} key={key} onClick={()=>selectPlace(key)}><Pix kind={key} size={50}/><span><strong>{good.label}</strong><small>{good.category==='STRUCTURE'?'Xây '+formatSecs(good.seconds||0)+(key==='aquaponics'?' · 5×3':''):good.category==='CROP'?'Lớn '+formatSecs(good.seconds||0):good.category==='ANIMAL'?'Nuôi & chăm sóc':'Trang trí'}</small></span><b>{good.price} xu</b></button>)}</div>
        </section>
      </aside>
    </div>
    <div className="eco-bottom-grid">
      <section className="eco-panel eco-store"><div className="eco-panel-head"><h2><Warehouse size={22}/> Kho & bán hàng</h2><span className="eco-count">{stock.length} loại</span></div>
        <div className="eco-inventory-grid">{stock.map(([kind,quantity])=>{
          const supply=nextActionForSupply(kind,picked);
          const canUse=Boolean(supply)||['meal','rice','aid_rice'].includes(kind);
          const usedName=kind==='meal'?'Ăn cơm':['rice','aid_rice'].includes(kind)?'Nấu cơm':kind==='oxygen'?'Bơm oxy':kind==='medicine'?'Chữa bệnh':'Cho ăn';
          const price=world.sellPrices[kind]||0;
          return <div className={`eco-stock${price>0?' eco-stock-sellable':''}`} key={kind}>
            <Pix kind={kind} size={47}/>
            <div className="eco-stock-info"><strong>{world.labels[kind]||kind}</strong><small>Đang có: <b>{quantity}</b></small></div>
            <div className="eco-stock-actions">
              {(canUse||['paddy','frog_feed','fish_feed','water_spinach','insect','medicine','oxygen'].includes(kind))&&<button className="eco-use" disabled={busy||(hungry&&!['meal','rice','aid_rice'].includes(kind))} onClick={()=>supplyAction(kind)}>{usedName}</button>}
            </div>
            {price>0&&<SellControls kind={kind} label={world.labels[kind]||kind} stock={quantity} unitPrice={price} disabled={busy||hungry} onSell={(saleKind,saleQuantity)=>submit('/game/sell',{kind:saleKind,quantity:saleQuantity})}/>}
          </div>;
        })}{stock.length===0&&<p>Kho đang trống. Hãy thu hoạch cây đầu tiên!</p>}</div>
        <div className="eco-kitchen"><div className="eco-kitchen-title"><span>🍳</span><div><strong>Bếp nông trại</strong><small>Chuẩn bị cơm trước khi nông dân đói</small></div></div>
          <div className="eco-kitchen-recipes">
            <div><b>🌾 2 Thóc → 1 Gạo</b><button disabled={busy||!canMill} onClick={()=>void submit('/game/craft',{recipe:'mill_rice',quantity:1})}>Xay gạo</button></div>
            <div><b>🍚 1 Gạo → 1 Cơm</b><button disabled={busy||!canCook} onClick={()=>void submit('/game/craft',{recipe:'cook_meal',quantity:1})}>Nấu cơm</button></div>
            <div><b>🍽️ Cơm trong kho: {inv('meal')}</b><button disabled={busy||inv('meal')<1||world.life.hungerPct>75} onClick={()=>void submit('/game/eat')}>Ăn cơm</button></div>
          </div>
        </div>
        <div className="eco-supplies"><strong>🛒 Mua gạo & vật tư</strong><div>{Object.entries(world.shopSupplies).map(([kind,price])=><button disabled={busy||(hungry&&kind!=='rice')} key={kind} onClick={()=>void submit('/game/shop',{kind,quantity:1})}>+ {world.labels[kind]} <b>{price} xu</b></button>)}</div></div>
      </section>
      <section className="eco-panel eco-missions"><div className="eco-panel-head"><h2><Leaf size={22}/> Mục tiêu hôm nay</h2></div><div className="eco-mission-list">{[
        {done:entities.some(e=>e.kind==='rice_crop')||inv('paddy')>3,title:'Gieo lúa lấy thóc'},
        {done:entities.some(e=>e.kind==='chicken'),title:'Nuôi một con gà'},
        {done:entities.some(e=>e.kind==='tank'||e.kind==='pond'),title:'Xây ao hoặc thùng nuôi'},
        {done:entities.some(e=>e.kind==='hive')&&entities.some(e=>e.kind==='flower'),title:'Trồng hoa và nuôi ong'},
      ].map((mission,index)=><div key={index} className={mission.done?'done':''}><span className="eco-mission-icon">{mission.done?<Check size={20}/>:index+1}</span><strong>{mission.title}</strong></div>)}</div>
        <div className="eco-log"><h3>🧾 Hoạt động gần đây</h3>{world.history.length===0?<p>Chưa có giao dịch nào.</p>:world.history.slice(0,4).map((event,i)=><div key={i}><span>{event.type==='SELL_TO_RESTAURANT'?'Bán':event.type==='BUY'?'Mua':event.type==='CRAFT'?'Xay':event.type==='SUPPLY'?'Mua vật tư':'Hoạt động'} {world.labels[event.kind]||world.catalog[event.kind]?.label||event.kind}</span><b className={event.coins>=0?'positive':'negative'}>{event.coins>0?'+':''}{event.coins} xu</b></div>)}</div>
      </section>
    </div>
    {lesson&&<HarvestDialog key={lesson.challenge.id} challenge={lesson.challenge} open onClose={()=>{if(!busy)setLesson(null);}} onAnswer={answer=>void answerHarvest(answer)} busy={busy} error={lessonError} now={now}/>}
    <div className="eco-note"><span><Heart size={16}/> Mỗi mùa vụ là một câu chuyện mới.</span><span><Leaf size={16}/> Nông trại kiến thức</span></div>
  </div>;
}

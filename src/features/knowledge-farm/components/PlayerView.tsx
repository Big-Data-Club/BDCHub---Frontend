/* eslint-disable @next/next/no-img-element -- fixed-size pixel sprites from the original game */
'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {Check,X} from 'lucide-react';
import {api,post} from '../lib/api';
import {formatSecs,sprite,entityFootprint} from '../lib/economy';
import {getEntityShortcuts,nudgeMovePreview,shouldIgnoreFarmShortcut} from '../lib/farmShortcuts';
import type {FarmShortcut} from '../lib/farmShortcuts';
import type {EcoCatalogEntry,EcoEntity,EcoWorld} from '../lib/economy';
import type {Challenge, AnswerResult, Species, LearningMode} from '../types';
import {HarvestDialog} from './HarvestDialog';
import {SpeciesGuide} from './SpeciesGuide';
import '../game/eco.css';
type ViewProps={flash:(message:string)=>void;fail:(error:unknown)=>void;catalogInfo:Species[];onReward:()=>void;score:number|null;dailyEarned:number;dailyLimit:number;message:string;error:string};
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

export default function PlayerView({flash,fail,catalogInfo,onReward,score,dailyEarned,dailyLimit,message,error}:ViewProps){
  const [learningMode,setLearningMode]=useState<LearningMode>('quiz');
  const [lesson,setLesson]=useState<{challenge:Challenge;entityId:string;action:string}|null>(null);
  const [lessonError,setLessonError]=useState('');
  const [lessonResult,setLessonResult]=useState<AnswerResult|null>(null);
  const [now,setNow]=useState(Date.now());
  const actionLock=useRef(false), requestVersion=useRef(0);
  const [world,setWorld]=useState<EcoWorld|null>(null);
  const [mode,setMode]=useState<Mode>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [movePreview,setMovePreview]=useState<{x:number;y:number}|null>(null);
  const [tab,setTab]=useState<Tab>('CROP');
  const [panel,setPanel]=useState<'shop'|'bag'|'info'|null>(null);
  const [busy,setBusy]=useState(false);
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
    const timer=setInterval(()=>{if(!document.hidden&&!actionLock.current)load().catch(()=>{});},15000);
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
    setPanel(null);
    actionLock.current=true;setBusy(true);++requestVersion.current;setLessonError('');setLessonResult(null);
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
      if(result.correct){
        setLesson(null);
        if(lesson.action==='SELL_CHICKEN'||['fish','frog'].includes(picked?.kind||''))setSelected(null);
        setWorld(previous=>previous&&({...previous,entities:previous.entities.map(entity=>entity.id===lesson.entityId?{...entity,ready:0}:entity)}));
        flash(`Thu hoạch thành công! +${result.awarded} điểm. ${result.explanation}`);
        onReward();
      }else{
        setLessonResult(result);
      }
      void load().catch(fail);
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
      flash(result.message);void load().catch(fail);return true;
    }catch(error){fail(error);return false;}
    finally{actionLock.current=false;setBusy(false);}
  };
  const catchInsect=async(insectId:string)=>{
    if(actionLock.current)return;
    actionLock.current=true;++requestVersion.current;setBusy(true);
    // Remove the insect immediately; the next authoritative state restores it if the catch fails.
    setWorld(previous=>previous&&({...previous,wildInsects:previous.wildInsects.filter(insect=>insect.id!==insectId)}));
    try{
      const result=await post<{message:string}>('/game/catch',{insectId});
      flash(result.message);
    }catch(error){fail(error);}
    finally{
      actionLock.current=false;setBusy(false);
      void load().catch(fail);
    }
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
    if(bug){if(world.life.hungerPct===0){flash('Nông dân cần ăn cơm để bắt côn trùng!');return;}void catchInsect(bug.id);return;}
    // A fish/frog belongs to its water tile: choose the animal before the habitat.
    const hit=entities.filter(e=>{const {width,height}=entityFootprint(e.kind);return x>=e.x&&x<e.x+width&&y>=e.y&&y<e.y+height;});
    const target=hit.find(e=>e.category==='ANIMAL')||hit.find(e=>e.category==='CROP')||hit[hit.length-1];
    setPanel(null);
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
      if(panel){if(event.key==='Escape'){event.preventDefault();setPanel(null);}return;}
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
  const selectPlace=(kind:string)=>{if(world?.life.hungerPct===0){flash('Nông dân cần ăn cơm để làm tiếp!');return;}setMode({type:'place',kind});setMovePreview(null);setSelected(null);setPanel(null);};
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

  return <div className="eco eco-v4 eco-v5">
    <header className="eco-play-heading">
      <div className="eco-play-title"><span aria-hidden="true">✿</span><div><small>NÔNG TRẠI KIẾN THỨC</small><h1>{world.farm.name}</h1></div></div>
      <label className="eco-learning-select">Thu hoạch bằng <select aria-label="Cách học khi thu hoạch" value={learningMode} disabled={busy||!!lesson} onChange={event=>setLearningMode(event.target.value as LearningMode)}><option value="quiz">Quiz</option><option value="flashcard">Flashcard</option></select></label>
    </header>
    <main className="eco-play-frame">
      <EcoGame entities={entities} catalog={world.catalog} selected={selected} mode={mode} movePreview={mode?.type==='move'?movePreview:null} insects={world.wildInsects||[]} onTile={onTile} disabled={busy||!!lesson}/>
      <div className="eco-play-hud" aria-label="Trạng thái nông trại">
        <span>⭐ Cấp {world.farm.level} · {world.farm.xp} XP</span><span>🪙 {world.farm.coins} xu</span><span>📘 {score ?? '—'} điểm · {dailyEarned}/{dailyLimit} hôm nay</span><span className={hungry?'eco-urgent':''}>🍚 {world.life.hungerPct}%</span><span>🌾 {harvestable} sẵn sàng</span>{needCare>0&&<span className="eco-urgent">❤️ {needCare} cần chăm</span>}
      </div>
      {message&&<div className="eco-play-notice" role="status">{message}</div>}
      {error&&<div className="eco-play-notice eco-play-error" role="alert">{error} <button onClick={()=>window.location.reload()}>Tải lại</button></div>}
      {mode&&<div className="eco-build-hint">
        <span>{mode.type==='place'?'Chọn ô để đặt '+(world.catalog[mode.kind]?.label||mode.kind):'Di chuyển đến ô '+(movePreview?'('+(movePreview.x+1)+', '+(movePreview.y+1)+')':'')}</span>
        {mode.type==='move'&&<button className="eco-confirm-move" disabled={busy} onClick={confirmMove}><Check size={16}/> Đặt</button>}
        <button onClick={()=>{setMode(null);setMovePreview(null);}}><X size={16}/> Hủy</button>
      </div>}
      {picked&&pickedCatalog&&!panel&&!mode&&<aside className="eco-context-panel" aria-label="Vật thể đã chọn">
        <div className="eco-context-title"><Pix kind={picked.kind} size={43}/><div><h2>{pickedCatalog.label}</h2><small>{stateText(picked)}</small></div><button type="button" aria-label="Bỏ chọn" onClick={()=>setSelected(null)}><X size={17}/></button></div>
        {['CROP','ANIMAL'].includes(picked.category)&&<div className="eco-context-progress"><i style={{width:(picked.progress*100)+'%'}}/></div>}
        <div className="eco-shortcuts-actions">
          {shortcuts.map(shortcut=><button key={shortcut.key} type="button" disabled={busy||hungry||!shortcut.enabled||Boolean(mode)} title={shortcut.reason} onClick={()=>triggerShortcut(shortcut)}><kbd>{shortcut.key}</kbd>{shortcut.label}</button>)}
          <button type="button" disabled={busy||hungry} onClick={startMove}><kbd>0</kbd>Di chuyển</button>
          <button type="button" disabled={busy||hungry} onClick={removeSelected}><kbd>Del</kbd>Gỡ</button>
        </div>
        <button className="eco-context-info" type="button" onClick={()=>setPanel('info')}>ⓘ Thông tin & cách chăm</button>
      </aside>}
      {panel&&<div className="eco-window-shade" onClick={()=>setPanel(null)}>
        <section className="eco-pixel-window" role="dialog" aria-modal="true" aria-label={panel==='shop'?'Cửa hàng':panel==='bag'?'Kho và bán hàng':'Thông tin nông trại'} onClick={event=>event.stopPropagation()}>
          <div className="eco-window-title"><strong>{panel==='shop'?'✿ Cửa hàng':panel==='bag'?'▣ Kho & bán hàng':'ⓘ Sổ tay nông trại'}</strong><button type="button" aria-label="Đóng cửa sổ" onClick={()=>setPanel(null)}>✕</button></div>
          <div className="eco-window-body">
            {panel==='shop'&&<>
              <div className="eco-category-tabs">{TABS.map(t=><button key={t.key} className={tab===t.key?'active':''} onClick={()=>setTab(t.key)}><b>{t.symbol}</b><span>{t.label}</span></button>)}</div>
              <div className="eco-product-grid">{catalog.map(([key,good]:[string,EcoCatalogEntry])=><button disabled={busy||hungry} className={'eco-product '+(mode?.type==='place'&&mode.kind===key?'chosen':'')} key={key} onClick={()=>selectPlace(key)}><Pix kind={key} size={43}/><strong>{good.label}</strong><small>{good.category==='STRUCTURE'?'Xây '+formatSecs(good.seconds||0):good.category==='CROP'?'Lớn '+formatSecs(good.seconds||0):good.category==='ANIMAL'?'Nuôi & chăm sóc':'Trang trí'}</small><b>{good.price} xu</b></button>)}</div>
              <div className="eco-window-supplies"><strong>Vật tư</strong>{Object.entries(world.shopSupplies).map(([kind,price])=><button disabled={busy||(hungry&&kind!=='rice')} key={kind} onClick={()=>void submit('/game/shop',{kind,quantity:1})}>+ {world.labels[kind]} · {price} xu</button>)}</div>
            </>}
            {panel==='bag'&&<>
              <div className="eco-inventory-grid">{stock.map(([kind,quantity])=>{
                const supply=nextActionForSupply(kind,picked);
                const canUse=Boolean(supply)||['meal','rice','aid_rice'].includes(kind);
                const usedName=kind==='meal'?'Ăn cơm':['rice','aid_rice'].includes(kind)?'Nấu cơm':kind==='oxygen'?'Bơm oxy':kind==='medicine'?'Chữa bệnh':'Cho ăn';
                const price=world.sellPrices[kind]||0;
                return <div className={'eco-stock'+(price>0?' eco-stock-sellable':'')} key={kind}>
                  <Pix kind={kind} size={42}/><div className="eco-stock-info"><strong>{world.labels[kind]||kind}</strong><small>Đang có: {quantity}</small></div>
                  {(canUse||['paddy','frog_feed','fish_feed','water_spinach','insect','medicine','oxygen'].includes(kind))&&<button className="eco-use" disabled={busy||(hungry&&!['meal','rice','aid_rice'].includes(kind))} onClick={()=>supplyAction(kind)}>{usedName}</button>}
                  {price>0&&<SellControls kind={kind} label={world.labels[kind]||kind} stock={quantity} unitPrice={price} disabled={busy||hungry} onSell={(saleKind,saleQuantity)=>submit('/game/sell',{kind:saleKind,quantity:saleQuantity})}/>}
                </div>;
              })}{stock.length===0&&<p>Kho đang trống. Hãy thu hoạch cây đầu tiên!</p>}</div>
              <div className="eco-window-kitchen"><strong>🍳 Bếp nông trại</strong><button disabled={busy||!canMill} onClick={()=>void submit('/game/craft',{recipe:'mill_rice',quantity:1})}>2 thóc → 1 gạo</button><button disabled={busy||!canCook} onClick={()=>void submit('/game/craft',{recipe:'cook_meal',quantity:1})}>1 gạo → 1 cơm</button><button disabled={busy||inv('meal')<1||world.life.hungerPct>75} onClick={()=>void submit('/game/eat')}>Ăn cơm ({inv('meal')})</button></div>
            </>}
            {panel==='info'&&<>
              {picked&&pickedCatalog&&<div className="eco-info-species"><div className="eco-selected"><Pix kind={picked.kind} size={48}/><div><h3>{pickedCatalog.label}</h3><small>{stateText(picked)}</small></div></div>{info&&<SpeciesGuide species={info}/>}</div>}
              <div className="eco-info-grid"><section><h3>Điều khiển</h3><p>Click để chọn · WASD để đi · phím 1–4 để chăm · 0 và mũi tên để di chuyển · Del để gỡ.</p><p>Nhấn vào côn trùng trên bản đồ để bắt. Thu hoạch cần trả lời một câu học tập.</p></section><section><h3>Mục tiêu</h3>{[
                {done:entities.some(e=>e.kind==='rice_crop')||inv('paddy')>3,title:'Gieo lúa lấy thóc'},
                {done:entities.some(e=>e.kind==='chicken'),title:'Nuôi một con gà'},
                {done:entities.some(e=>e.kind==='tank'||e.kind==='pond'),title:'Xây ao hoặc thùng nuôi'},
                {done:entities.some(e=>e.kind==='hive')&&entities.some(e=>e.kind==='flower'),title:'Trồng hoa và nuôi ong'},
              ].map((mission,index)=><p key={index}>{mission.done?'✓':'□'} {mission.title}</p>)}</section></div>
              <div className="eco-info-log"><h3>Hoạt động gần đây</h3>{world.history.slice(0,4).map((event,index)=><p key={index}>{world.labels[event.kind]||world.catalog[event.kind]?.label||event.kind} · {event.coins>0?'+':''}{event.coins} xu</p>)}</div>
              <div className="eco-info-rename"><input value={farmName} maxLength={90} aria-label="Tên nông trại" onChange={event=>setFarmName(event.target.value)}/><button onClick={()=>{void submit('/game/rename',{name:farmName});setPanel(null);}}>Đổi tên</button></div>
            </>}
          </div>
        </section>
      </div>}
      <nav className="eco-play-dock" aria-label="Công cụ nông trại">
        <button type="button" className={panel==='shop'?'active':''} onClick={()=>setPanel(value=>value==='shop'?null:'shop')}>🌱 <span>Trồng & xây</span></button>
        <button type="button" className={panel==='bag'?'active':''} onClick={()=>setPanel(value=>value==='bag'?null:'bag')}>🎒 <span>Kho & bán</span></button>
        <button type="button" disabled={busy} onClick={recover}>🍚 <span>{recoverLabel}</span></button>
        <button type="button" className={panel==='info'?'active':''} aria-label="Thông tin nông trại" onClick={()=>setPanel(value=>value==='info'?null:'info')}>ⓘ <span>Thông tin</span></button>
        <button type="button" aria-label="Làm mới nông trại" onClick={()=>void load().catch(fail)}>↻ <span>Làm mới</span></button>
      </nav>
    </main>
    {lesson&&<HarvestDialog key={lesson.challenge.id} challenge={lesson.challenge} open onClose={()=>{if(!busy){setLesson(null);setLessonResult(null);}}} onAnswer={answer=>void answerHarvest(answer)} busy={busy} error={lessonError} result={lessonResult} now={now}/>}
  </div>;
}

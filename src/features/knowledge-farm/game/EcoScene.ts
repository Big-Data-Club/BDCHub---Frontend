import * as Phaser from 'phaser';
import type { EcoEntity, EcoCatalog, WildInsect } from '../lib/economy';
import {WATER_HABITAT,WATER_HABITAT_CAPACITY,entityFootprint} from '../lib/economy';

export const GRID_SIZE = 48;
export const GRID_W = 20;
export const GRID_H = 14;
export const VIEW_W = GRID_W * GRID_SIZE;
export const VIEW_H = GRID_H * GRID_SIZE;
type TilePress = (x:number,y:number)=>void;
type FarmMode = {type:'place';kind:string}|{type:'move';id:string}|null;
const TYPES=['pond_wide','tank_wide','aquaponics_wide','grass','path','soil','house','farmer','seedling','egg','insect','ladybug','grasshopper','butterfly','dragonfly','rice','chicken','frog','bee','fish','rice_crop','water_spinach','mustard','flower','fence','tank','pond','aquaponics','hive','bench','flowerpot'];

export class EcoScene extends Phaser.Scene {
 private actors!:Phaser.GameObjects.Container;
 private avatar!:Phaser.GameObjects.Container;
 private marker!:Phaser.GameObjects.Graphics;
 private keys?:Record<string,Phaser.Input.Keyboard.Key>;
 private pos={x:9,y:8};
 private entities:EcoEntity[]=[];
 private goods:EcoCatalog={};
 private picked:string|null=null;
 private mode:FarmMode=null;
 private press:TilePress=()=>{};
 private assetError:()=>void=()=>{};
 private hovered={x:-1,y:-1};
 private movePreview:{x:number;y:number}|null=null;
 private motion=0;
 private insects:WildInsect[]=[];
 private effects:Phaser.Tweens.Tween[]=[];
 constructor(){super({key:'EcoWorld'});}
 attach(cb:TilePress,onAssetError:()=>void){this.press=cb;this.assetError=onAssetError;}
 preload(){
  this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR,this.assetError);
  for(const asset of TYPES){this.load.image(`px_${asset}`,`/knowledge-farm/sprites/${asset}.png`);}
 }
 create(){
  this.cameras.main.setBackgroundColor('#92bd75');
  const floor=this.add.container(0,0).setDepth(0);
  for(let y=0;y<GRID_H;y++)for(let x=0;x<GRID_W;x++){
   const path=(x===4&&y>2&&y<12)||(y===9&&x>=4&&x<=15);
   const tile=this.add.image(x*GRID_SIZE+GRID_SIZE/2,y*GRID_SIZE+GRID_SIZE/2,`px_${path?'path':'grass'}`);
   tile.setDisplaySize(GRID_SIZE,GRID_SIZE);floor.add(tile);
   const hash=(x*113+y*41+x*y*7)%37;
   if(!path&&hash===0&&!((x>0&&x<5)&&(y<5))){const a=this.add.graphics();a.fillStyle(0x4c9167,.6).fillRect(x*GRID_SIZE+12,y*GRID_SIZE+31,3,5).fillRect(x*GRID_SIZE+18,y*GRID_SIZE+35,2,3);floor.add(a);}
  }
  // The home is permanent scenery; these three-by-three tiles are blocked on the server.
  const homeShadow=this.add.ellipse(2.65*GRID_SIZE,3.7*GRID_SIZE,152,23,0x234d31,.18).setDepth(1);
  const house=this.add.image(2.5*GRID_SIZE,2.4*GRID_SIZE,'px_house').setDisplaySize(155,155).setDepth(3);
  this.add.text(2.5*GRID_SIZE,4.1*GRID_SIZE,'NHÀ VƯỜN',{fontFamily:'monospace',fontSize:'12px',fontStyle:'bold',color:'#355d3f',backgroundColor:'#f5e7b8',padding:{x:7,y:3}}).setOrigin(.5).setDepth(5);
  void homeShadow;void house;
  const border=this.add.graphics().setDepth(5);
  border.lineStyle(5,0x578d61,.8).strokeRect(2,2,VIEW_W-4,VIEW_H-4);
  this.actors=this.add.container(0,0).setDepth(10);
  this.marker=this.add.graphics().setDepth(20);
  this.avatar=this.add.container(this.pos.x*GRID_SIZE+24,this.pos.y*GRID_SIZE+22).setDepth(30);
  const avatarShadow=this.add.ellipse(0,13,30,10,0x31583d,.30);
  const farmer=this.add.image(0,-6,'px_farmer').setDisplaySize(47,47);
  this.avatar.add([avatarShadow,farmer]);
  this.tweens.add({targets:farmer,y:-9,duration:750,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
   const x=Math.floor(pointer.worldX/GRID_SIZE),y=Math.floor(pointer.worldY/GRID_SIZE);
   if(x>=0&&x<GRID_W&&y>=0&&y<GRID_H){this.press(x,y);}
  });
  this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{
   this.hovered={x:Math.floor(pointer.worldX/GRID_SIZE),y:Math.floor(pointer.worldY/GRID_SIZE)};this.drawPointer();
  });
  this.input.on('pointerout',()=>{this.hovered={x:-1,y:-1};this.drawPointer()});
  if(this.input.keyboard){
   this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT',false) as Record<string,Phaser.Input.Keyboard.Key>;

  }
  this.redraw();
 }
 update(_:number,delta:number){
  this.motion+=delta*.001;
  if(!this.keys || this.mode?.type==='move')return;
  // Typing a quantity or changing a form field must not move the farmer.
  const active=document.activeElement;
  if(document.querySelector('[role="dialog"]') || !(active instanceof HTMLElement) || !active.closest('.eco-stage'))return;
  if(this.motion<.135)return;
  this.motion=0;
  const held=(...names:string[])=>names.some(n=>this.keys?.[n]?.isDown);
  const dx=Number(held('D','RIGHT'))-Number(held('A','LEFT'));
  const dy=Number(held('S','DOWN'))-Number(held('W','UP'));
  if(!dx&&!dy)return;
  this.walk(dx,dy);
 }
 walk(dx:number,dy:number){
  if(!this.avatar || document.querySelector('[role="dialog"]'))return;
  const x=Math.min(GRID_W-1,Math.max(0,this.pos.x+dx)),y=Math.min(GRID_H-1,Math.max(0,this.pos.y+dy));
  if((x>=1&&x<=3&&y>=1&&y<=3)||(x===0&&y===0)||this.entities.some(e=> (e.kind==='fence'&&e.x===x&&e.y===y)||(e.category==='STRUCTURE'&&x>=e.x&&x<e.x+entityFootprint(e.kind).width&&y>=e.y&&y<e.y+entityFootprint(e.kind).height)))return;
  this.pos={x,y};
  this.avatar.setPosition(x*GRID_SIZE+24,y*GRID_SIZE+22);
 }
 refresh(entities:EcoEntity[],goods:EcoCatalog,selected:string|null,mode:FarmMode,insects:WildInsect[]=[]){this.entities=entities;this.goods=goods;this.picked=selected;this.mode=mode;this.insects=insects;if(this.actors)this.redraw();if(this.marker)this.drawPointer();}
 setMovePreview(preview:{x:number;y:number}|null){this.movePreview=preview;if(this.marker)this.drawPointer();}
 private texture(kind:string){return TYPES.includes(kind)?`px_${kind}`:'px_flowerpot';}
 private canDrop(x:number,y:number,w:number,h:number):boolean{
  if(x<0||y<0||x+w>GRID_W||y+h>GRID_H)return false;
  for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){
    const tx=x+dx,ty=y+dy;
    if((tx>=1&&tx<=3&&ty>=1&&ty<=3)||(tx===0&&ty===0))return false;
  }
  const activeMode=this.mode;
  if(!activeMode)return true;
  const kind=activeMode.type==='place'?activeMode.kind:this.entities.find(e=>e.id===activeMode.id)?.kind;
  if(!kind)return false;
  const ignored=activeMode.type==='move'?activeMode.id:null;
  const isAquatic=kind==='frog'||kind==='fish';
  const aquaticHousing=this.entities.find(e=>{
    if(!['pond','tank'].includes(e.kind)||e.buildLeft>0||e.oxygen<=15)return false;
    const inside=x>=e.x&&x<e.x+WATER_HABITAT.width&&y>=e.y&&y<e.y+WATER_HABITAT.height;
    const count=this.entities.filter(a=>a.id!==ignored&&['frog','fish'].includes(a.kind)&&a.x>=e.x&&a.x<e.x+WATER_HABITAT.width&&a.y>=e.y&&a.y<e.y+WATER_HABITAT.height).length;
    return inside&&count<WATER_HABITAT_CAPACITY;
  });
  if(isAquatic&&!aquaticHousing)return false;
  if(kind==='bee'&&!this.entities.some(e=>e.kind==='hive'&&e.buildLeft===0&&Math.abs(e.x-x)<=2&&Math.abs(e.y-y)<=2))return false;
  for(const e of this.entities){
    if(e.id===ignored)continue;
    const {width:ew,height:eh}=entityFootprint(e.kind);
    if(!(x<e.x+ew&&x+w>e.x&&y<e.y+eh&&y+h>e.y))continue;
    if(isAquatic&&e.id===aquaticHousing?.id)continue;
    if(e.kind==='aquaponics' && this.goods[kind]?.category==='CROP' &&
       e.buildLeft===0 && (x!==e.x || y!==e.y) && x>=e.x&&x<e.x+5&&y>=e.y&&y<e.y+3)continue;
    return false;
  }
  return true;
 }
 private drawPointer(){
  this.marker.clear();
  const {x,y}=this.mode?.type==='move' && this.movePreview ? this.movePreview : this.hovered;
  if(x<0||y<0||x>=GRID_W||y>=GRID_H)return;
  const currentMode = this.mode;
  const selectedKind =
   currentMode?.type === 'place' ? currentMode.kind :
   currentMode?.type === 'move' ? this.entities.find(e => e.id === currentMode.id)?.kind :
   null;
  const {width:w,height:h}=entityFootprint(selectedKind||'');
  const allowed=this.canDrop(x,y,w,h);
  this.marker.fillStyle(this.mode?(allowed?0xd7f5ac:0xf2a092):0xfff4d2,.21).fillRect(x*GRID_SIZE,y*GRID_SIZE,w*GRID_SIZE,h*GRID_SIZE);
  this.marker.lineStyle(this.mode?.type==='move'?4:2,this.mode?(allowed?0xf5e8b5:0xd65959):0xf5f5da,1).strokeRect(x*GRID_SIZE+2,y*GRID_SIZE+2,w*GRID_SIZE-4,h*GRID_SIZE-4);
  if(this.mode?.type==='move') {
    this.marker.fillStyle(allowed?0x245b3b:0xa13b32,.92).fillRoundedRect(x*GRID_SIZE+4,y*GRID_SIZE+4,Math.min(90,w*GRID_SIZE-8),24,5);
    // Graphics-only preview remains visible even when the cursor has left the canvas.
    this.marker.lineStyle(1,0xffffff,.75).strokeRect(x*GRID_SIZE+5,y*GRID_SIZE+5,w*GRID_SIZE-10,h*GRID_SIZE-10);
  }
 }
 private redraw(){
  this.effects.forEach(t=>t.remove());this.effects=[];
  this.actors.removeAll(true);
  // Water-loop pipes are visible only when fish + a finished water habitat sustain aquaponics.
  for(const bed of this.entities.filter(e=>e.kind==='aquaponics'&&e.buildLeft===0)){
   const structures=this.entities.filter(e=>(e.kind==='tank'||e.kind==='pond')&&e.buildLeft===0&&e.oxygen>15);
   const water=structures.find(h=>Math.abs(h.x-bed.x)<=4&&Math.abs(h.y-bed.y)<=4&&this.entities.some(a=>a.kind==='fish'&&Math.abs(a.x-h.x)<=3&&Math.abs(a.y-h.y)<=3));
   if(water){const x1=bed.x*GRID_SIZE+24,y1=bed.y*GRID_SIZE+24,x2=water.x*GRID_SIZE+24,y2=water.y*GRID_SIZE+24;
    const pipes=this.add.graphics();pipes.lineStyle(8,0x3c6970,.8).lineBetween(x1,y1,x2,y1);pipes.lineBetween(x2,y1,x2,y2);
    pipes.lineStyle(3,0x95d7d1,.9).lineBetween(x1,y1,x2,y1);pipes.lineBetween(x2,y1,x2,y2);this.actors.add(pipes);
   }
  }
  const fences=new Set(this.entities.filter(e=>e.kind==='fence').map(e=>`${e.x}:${e.y}`));
  // Connection-aware railing: neighboring fence posts are joined by actual rails, never depicted as loose wood.
  for(const e of this.entities.filter(o=>o.kind==='fence')){
   const x=e.x*GRID_SIZE+24,y=e.y*GRID_SIZE+22,has=(a:number,b:number)=>fences.has(`${a}:${b}`);
   const rail=this.add.graphics();rail.fillStyle(0x533c2c);
   if(has(e.x+1,e.y)){rail.fillRect(x,y-12,GRID_SIZE,7);rail.fillRect(x,y+2,GRID_SIZE,7);rail.fillStyle(0xcc8e57);rail.fillRect(x,y-10,GRID_SIZE,3);rail.fillRect(x,y+4,GRID_SIZE,3);}
   if(has(e.x,e.y+1)){rail.fillStyle(0x644331);rail.fillRect(x-12,y,7,GRID_SIZE);rail.fillRect(x+3,y,7,GRID_SIZE);rail.fillStyle(0xc18c58);rail.fillRect(x-11,y,3,GRID_SIZE);rail.fillRect(x+5,y,3,GRID_SIZE);}
   this.actors.add(rail);
  }
  const ordered=[...this.entities].sort((a,b)=>(a.category==='STRUCTURE'?0:1)-(b.category==='STRUCTURE'?0:1)||a.y-b.y||a.x-b.x);
  for(const e of ordered){
   const x=e.x*GRID_SIZE+24,y=e.y*GRID_SIZE+24;
   const isWater=['pond','tank'].includes(e.kind),isAqua=e.kind==='aquaponics',isWide=isWater||isAqua,isBuilding=e.category==='STRUCTURE';
   const {width:fw,height:fh}=entityFootprint(e.kind);
   const cx=isWide?x+(fw-1)*GRID_SIZE/2:x,cy=isWide?y+(fh-1)*GRID_SIZE/2:y;
   const node=this.add.container(cx,cy);
   const dim=isWide?96:isBuilding?72:e.category==='ANIMAL'?48:49;
   if(e.category==='CROP'){
    const soil=this.add.image(0,5,'px_soil').setDisplaySize(44,43);node.add(soil);
   }
   if(e.kind!=='fence'){
    const sprite=this.add.image(0,e.category==='CROP'?-8:-5,
      isWide?`px_${e.kind}_wide`:e.category==='CROP'&&e.progress<.22?'px_seedling':this.texture(e.kind));
    if(isWide) sprite.setDisplaySize(fw*GRID_SIZE,fh*GRID_SIZE);
    else sprite.setDisplaySize(dim,dim);
    if(e.category==='CROP'){
      // Five visibly distinct stages; water and server progress control growth.
      const stage=e.ready?1:(e.needsRewater||e.regrowLeft>0)?.34:e.progress<.22?.42:e.progress<.46?.61:e.progress<.70?.78:.94;
      sprite.setScale(sprite.scaleX*stage,sprite.scaleY*stage);
      if(!e.ready&&e.progress<.46)sprite.setTint(0xb6e5a2);
    }
    node.add(sprite);
    if(isWater){
      // Animated pixel ripples and bubbles inside the actual habitat.
      const wave=this.add.graphics();wave.lineStyle(2,0xb6f5e1,.65);
      wave.strokeEllipse(-42,6,24,6);wave.strokeEllipse(34,-12,19,5);
      wave.fillStyle(0xd1fff4,.7);wave.fillCircle(-22,-7,2);wave.fillCircle(48,15,2);
      node.add(wave);
      this.effects.push(this.tweens.add({targets:wave,alpha:{from:.15,to:.85},duration:1200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
    }
    if(isWater&&e.oxygen<=35){
      node.add(this.add.text(fw*GRID_SIZE/2-18,-fh*GRID_SIZE/2+14,'O₂!',{fontFamily:'monospace',fontSize:'13px',fontStyle:'bold',color:'#ffeca5',backgroundColor:'#79513f',padding:{x:3,y:2}}).setOrigin(.5));
    }
    if(isAqua){
      const lamp=this.add.text(fw*GRID_SIZE/2-17,-fh*GRID_SIZE/2+10,e.oxygen>15?'●':'!',{fontFamily:'monospace',fontSize:'18px',fontStyle:'bold',color:e.oxygen>15?'#83f6ad':'#ffdf7c',backgroundColor:'#28514f',padding:{x:3,y:1}}).setOrigin(.5);
      node.add(lamp);
    }
    if(e.category==='ANIMAL'&&['fish','frog'].includes(e.kind)){
      this.effects.push(this.tweens.add({targets:sprite,x:{from:-7,to:7},y:{from:-7,to:-11},duration:850+(e.x*53)%420,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
    }
    if(e.category==='ANIMAL'&&e.kind==='chicken'&&!e.contained){
     this.effects.push(this.tweens.add({targets:sprite,x:{from:-4,to:5},angle:{from:-4,to:4},duration:1450+e.x*29,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
    }
    if(e.category==='ANIMAL'&&e.kind==='bee'){this.effects.push(this.tweens.add({targets:sprite,y:{from:-11,to:-4},duration:740,yoyo:true,repeat:-1}))}
   }else{node.add(this.add.image(0,-2,'px_fence').setDisplaySize(45,45))}
   if(e.category==='CROP'||e.category==='ANIMAL'){
    const w=34;const bar=this.add.graphics();bar.fillStyle(0x25402f,.75).fillRoundedRect(-w/2,24,w,6,2);
    bar.fillStyle(e.sick?0xee6b6b:e.hungerPct===0&&e.category==='ANIMAL'?0xc99b68:0x91d56f).fillRoundedRect(-w/2+1,25,Math.max(1,(w-2)*e.progress),4,2);
    node.add(bar);
   }
   if(e.category==='CROP'&&e.needsRewater&&e.regrowLeft>0){
    // Keep the little sprout on its soil tile while recovery counts down.
    node.add(this.add.text(0,-32,`${e.regrowLeft}s`,{fontFamily:'monospace',fontSize:'12px',fontStyle:'bold',color:'#3a573d',backgroundColor:'#fff5ce',padding:{x:3,y:2}}).setOrigin(.5));
   }
   if(e.ready>0){const gold=this.add.graphics();gold.fillStyle(0xffd777).fillCircle(18,-21,9);gold.lineStyle(1,0x855e38).strokeCircle(18,-21,9);node.add(gold);node.add(this.add.text(18,-21,'✓',{fontFamily:'monospace',fontSize:'12px',fontStyle:'bold',color:'#4f5031'}).setOrigin(.5));}
   else if(e.category==='ANIMAL'&&e.hungerPct===0){node.add(this.add.text(16,-21,'!',{fontFamily:'monospace',fontSize:'16px',backgroundColor:'#f4cc76',color:'#63413c'}).setOrigin(.5))}
   if(e.sick){node.add(this.add.text(-17,-23,'+',{fontFamily:'monospace',fontSize:'18px',color:'#ef6868'}).setOrigin(.5))}
   if(e.buildLeft>0){const dark=this.add.rectangle(0,0,45,45,0x23372e,.38);node.add(dark);node.add(this.add.text(0,0,'🔨',{fontSize:'18px'}).setOrigin(.5))}
   if(e.realLinked){node.add(this.add.text(-16,-27,'●',{fontSize:'13px',color:'#4cd88d'}));}
   if(e.id===this.picked){const frame=this.add.rectangle(0,0,isWide?GRID_SIZE*fw-6:45,isWide?GRID_SIZE*fh-6:45,0x000000,0).setStrokeStyle(3,0xffec9f);node.add(frame);}
   this.actors.add(node);
  }
  // Server-supplied insect identities/positions remain stable across refresh.
  // Movements are decorative only; catching uses the authoritative tile + ID.
  for(const [i,bug] of this.insects.entries()){
    const x=bug.x*GRID_SIZE+24, y=bug.y*GRID_SIZE+17;
    const sprite=this.add.image(x,y,`px_${bug.species}`).setDisplaySize(35,35).setDepth(15);
    this.actors.add(sprite);
    this.effects.push(this.tweens.add({targets:sprite,x:{from:x-5,to:x+5},y:{from:y-7,to:y+5},duration:830+((i*97)%380),yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
    if(bug.species==='butterfly'||bug.species==='dragonfly'){
      this.effects.push(this.tweens.add({targets:sprite,angle:{from:-8,to:8},duration:420,yoyo:true,repeat:-1}));
    }
    // A gentle highlight helps users distinguish catchable wildlife.
    const glow=this.add.ellipse(x,y+19,25,7,0xfff3a9,.48);
    this.actors.add(glow);
    this.effects.push(this.tweens.add({targets:glow,alpha:{from:.14,to:.48},duration:900,yoyo:true,repeat:-1}));
  }
 }
}

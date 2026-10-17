'use client';
import {useEffect,useRef,useState} from 'react';
import type {EcoCatalog,EcoEntity,WildInsect} from '../lib/economy';
import type {EcoScene} from './EcoScene';
type Mode={type:'place';kind:string}|{type:'move';id:string}|null;
export default function EcoGame({entities,catalog,selected,mode,insects,movePreview,onTile,disabled}:{entities:EcoEntity[];catalog:EcoCatalog;selected:string|null;mode:Mode;insects:WildInsect[];movePreview:{x:number;y:number}|null;onTile:(x:number,y:number)=>void;disabled:boolean}){
 const [error,setError]=useState('');
 const locked=useRef(disabled);locked.current=disabled;
 const mount=useRef<HTMLDivElement>(null),game=useRef<import('phaser').Game|null>(null),scene=useRef<EcoScene|null>(null),cb=useRef(onTile);
 cb.current=onTile;const latest=useRef({entities,catalog,selected,mode,insects});latest.current={entities,catalog,selected,mode,insects};
 const preview=useRef(movePreview);preview.current=movePreview;
 useEffect(()=>{let done=false;(async()=>{
  const Phaser=await import('phaser');const mod=await import('./EcoScene');if(done||!mount.current)return;
  const sc=new mod.EcoScene();sc.attach((x,y)=>{if(!locked.current)cb.current(x,y)});sc.load.on('loaderror',()=>{if(!done)setError('Không tải được ảnh game. Hãy tải lại trang.')});sc.refresh(latest.current.entities,latest.current.catalog,latest.current.selected,latest.current.mode,latest.current.insects);sc.setMovePreview(preview.current);
  const pg=new Phaser.Game({type:Phaser.AUTO,parent:mount.current,width:mod.VIEW_W,height:mod.VIEW_H,backgroundColor:'#95c57f',render:{pixelArt:true,antialias:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[sc]});
  game.current=pg;scene.current=sc;pg.events.once(Phaser.Core.Events.READY,()=>{if(!done)sc.refresh(latest.current.entities,latest.current.catalog,latest.current.selected,latest.current.mode,latest.current.insects)});
 })().catch(()=>{if(!done)setError('Không khởi động được game. Hãy tải lại trang.')});return()=>{done=true;scene.current=null;game.current?.destroy(true);game.current=null}},[]);
 useEffect(()=>{scene.current?.refresh(entities,catalog,selected,mode,insects)},[entities,catalog,selected,mode,insects]);
 useEffect(()=>{scene.current?.setMovePreview(movePreview)},[movePreview]);
 return <div><div className="eco-stage" ref={mount} tabIndex={0} onPointerDown={()=>mount.current?.focus()} aria-label="Bản đồ pixel art. Dùng WASD hoặc click để chơi" role="application"/>{error&&<p role="alert">{error}</p>}
 <div className="eco-touch-controls" aria-label="Di chuyển nông dân">{[{label:'Trái',x:-1,y:0,icon:'←'},{label:'Lên',x:0,y:-1,icon:'↑'},{label:'Xuống',x:0,y:1,icon:'↓'},{label:'Phải',x:1,y:0,icon:'→'}].map(direction=><button key={direction.label} type="button" aria-label={direction.label} disabled={disabled||mode?.type==='move'} onClick={()=>scene.current?.walk(direction.x,direction.y)}>{direction.icon}</button>)}</div></div>;
}

'use client'

import { useState } from 'react'
import { Contact, Users, UsersRound, Radio, Upload, ArrowRight, CheckCircle2 } from 'lucide-react'

type RecipientType='personal'|'group'|'community'|'channel'
type Source='WhatsApp'|'WhatsApp Business'
type Recipient={id:string,name:string,type:RecipientType,source:Source,phone?:string,category?:string,area?:string,canSend:boolean}

const items=[
  {type:'personal' as const,title:'Personal Contacts',desc:'Device contact picker किंवा CSV/TXT/JSON',icon:<Contact size={28}/>},
  {type:'group' as const,title:'Groups',desc:'Group list import करा. Admin-only groups blocked ठेवता येतील.',icon:<Users size={28}/>},
  {type:'community' as const,title:'Communities',desc:'Community master CSV/TXT/JSON मधून import करा.',icon:<UsersRound size={28}/>},
  {type:'channel' as const,title:'Channels',desc:'Channel master CSV/TXT/JSON मधून import करा.',icon:<Radio size={28}/>},
]

export default function ImportCenter(){
 const [status,setStatus]=useState('')
 const source=(typeof window!=='undefined'?(localStorage.getItem('jb-wa-source') as Source):null)||'WhatsApp'

 function save(fresh:Recipient[]){
   const old=JSON.parse(localStorage.getItem('jb-recipients')||'[]') as Recipient[]
   localStorage.setItem('jb-recipients',JSON.stringify([...old,...fresh]))
 }
 async function importPersonal(){
   const nav=navigator as Navigator & {contacts?:{select:(p:string[],o:{multiple:boolean})=>Promise<Array<{name?:string[],tel?:string[]}>>}}
   if(nav.contacts?.select){
     try{const picked=await nav.contacts.select(['name','tel'],{multiple:true});const fresh:Recipient[]=picked.flatMap(c=>(c.tel||[]).slice(0,1).map(t=>({id:crypto.randomUUID(),name:c.name?.[0]||t,type:'personal',source,phone:t,canSend:true})));save(fresh);setStatus(`${fresh.length} contacts imported`);return}catch{return}
   }
   importFile('personal')
 }
 function importFile(type:RecipientType){
   const input=document.createElement('input');input.type='file';input.accept='.csv,.txt,.json';
   input.onchange=async()=>{const file=input.files?.[0];if(!file)return;const text=await file.text();const fresh:Recipient[]=[];
     try{if(file.name.toLowerCase().endsWith('.json')){const rows=JSON.parse(text);if(Array.isArray(rows))rows.forEach((r:any)=>{if(!r?.name)return;fresh.push({id:crypto.randomUUID(),name:String(r.name),type,source,phone:type==='personal'?String(r.phone||'')||undefined:undefined,category:type==='personal'?undefined:String(r.category||'Other'),area:type==='personal'?undefined:String(r.area||'')||undefined,canSend:type==='group'?String(r.canSend??'true').toLowerCase()!=='false':true})})}else{text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach((line,i)=>{const c=line.split(',').map(x=>x.trim());if(i===0&&c[0]?.toLowerCase().includes('name'))return;if(!c[0])return;if(type==='personal'){if(c[1])fresh.push({id:crypto.randomUUID(),name:c[0],phone:c[1],type,source,canSend:true})}else fresh.push({id:crypto.randomUUID(),name:c[0],category:c[1]||'Other',area:c[2]||undefined,type,source,canSend:type==='group'?!['no','false'].includes((c[3]||'').toLowerCase()):true})})}}
     catch{setStatus('File format invalid');return}save(fresh);setStatus(`${fresh.length} records imported`)};input.click()
 }
 function start(type:RecipientType){if(type==='personal')importPersonal();else importFile(type)}
 return <main className="connect-shell"><section className="connect-card import-card"><div className="eyebrow">STEP 2</div><h1>Import Center</h1><p className="connect-lead">WhatsApp connect केल्यानंतर recipients master तयार करा.</p><div className="import-grid">{items.map(i=><button key={i.type} className="import-option" onClick={()=>start(i.type)}><span className="import-icon">{i.icon}</span><span><b>{i.title}</b><small>{i.desc}</small></span><Upload size={20}/></button>)}</div>{status&&<div className="notice"><CheckCircle2 size={19}/><div><b>{status}</b><span>Data Recipient Master मध्ये save झाला आहे.</span></div></div>}<button className="primary connect-primary" onClick={()=>window.location.href='/'}>Go to Recipient Master <ArrowRight size={19}/></button></section></main>
}

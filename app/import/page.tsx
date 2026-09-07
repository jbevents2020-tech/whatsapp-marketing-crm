'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Contact, ExternalLink, Link2, MessageCircleMore, Radio, Users, UsersRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type RecipientType='personal'|'group'|'community'|'channel'
type Source='WhatsApp'|'WhatsApp Business'
type RecipientRow={id:string,name:string,recipient_type:RecipientType,whatsapp_source:Source,phone?:string|null,category?:string|null,area?:string|null,can_send:boolean,link?:string|null}
type ImportMode='home'|RecipientType

const meta:Record<RecipientType,{title:string;desc:string;placeholder:string}>={
 personal:{title:'Personal Contacts',desc:'Phone contact picker मधून WhatsApp contacts निवडा.',placeholder:'Mobile number'},
 group:{title:'Groups',desc:'WhatsApp मधून group invite link copy करून येथे paste करा.',placeholder:'https://chat.whatsapp.com/...'},
 community:{title:'Communities',desc:'Community चे नाव आणि उपलब्ध share/invite link paste करा.',placeholder:'Community share/invite link'},
 channel:{title:'Channels',desc:'WhatsApp Channel link paste करून master मध्ये save करा.',placeholder:'https://whatsapp.com/channel/...'},
}

export default function ImportCenter(){
 const [mode,setMode]=useState<ImportMode>('home')
 const [status,setStatus]=useState('')
 const [name,setName]=useState('')
 const [link,setLink]=useState('')
 const [area,setArea]=useState('')
 const [category,setCategory]=useState('Other')
 const [canSend,setCanSend]=useState<'yes'|'no'|'unknown'>('unknown')
 const [rows,setRows]=useState<RecipientRow[]>([])
 const [userId,setUserId]=useState<string|null>(null)
 const [source,setSource]=useState<Source>('WhatsApp')
 const selected=mode==='home'?null:meta[mode]
 const savedCount=useMemo(()=>rows.length,[rows])

 useEffect(()=>{void boot()},[])
 async function boot(){
  setSource((localStorage.getItem('jb-wa-source') as Source)||'WhatsApp')
  if(!supabase){setStatus('Supabase configuration missing.');return}
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){location.href='/login';return}
  setUserId(user.id)
  const {data,error}=await supabase.from('recipients').select('*').order('created_at',{ascending:false})
  if(error){setStatus(error.message);return}
  setRows((data||[]) as RecipientRow[])
 }

 async function saveOne(input:{name:string;type:RecipientType;phone?:string;link?:string;category?:string;area?:string;canSend:boolean;permissionStatus?:'verified'|'adminOnly'|'unknown'}){
  if(!supabase||!userId)return false
  const duplicate=rows.some(x=>x.recipient_type===input.type&&x.whatsapp_source===source&&((input.phone&&x.phone===input.phone)||(input.link&&x.link===input.link)||(!input.phone&&!input.link&&x.name.toLowerCase()===input.name.toLowerCase())))
  if(duplicate){setStatus('हे recipient आधीच master मध्ये आहे.');return false}
  const {data,error}=await supabase.from('recipients').insert({user_id:userId,name:input.name,recipient_type:input.type,whatsapp_source:source,phone:input.phone||null,link:input.link||null,category:input.category||null,area:input.area||null,can_send:input.canSend,permission_status:input.permissionStatus||null}).select('*').single()
  if(error){setStatus(error.message);return false}
  setRows(r=>[data as RecipientRow,...r]);setStatus(`${input.name} imported successfully.`);return true
 }

 async function pickContacts(){
  const nav=navigator as Navigator & {contacts?:{select:(p:string[],o:{multiple:boolean})=>Promise<Array<{name?:string[],tel?:string[]}>>}}
  if(!nav.contacts?.select){setStatus('या browser मध्ये Contact Picker उपलब्ध नाही. Chrome Android वापरा.');return}
  try{
   const picked=await nav.contacts.select(['name','tel'],{multiple:true});let added=0
   for(const c of picked){const phone=c.tel?.[0];if(!phone)continue;const nm=c.name?.[0]||phone;if(await saveOne({name:nm,type:'personal',phone,canSend:true}))added++}
   setStatus(`${added} contacts imported to cloud.`)
  }catch{setStatus('Contact selection cancelled.')}
 }

 function openWhatsApp(){window.open('https://web.whatsapp.com/','_blank','noopener,noreferrer')}
 async function saveAssisted(type:Exclude<RecipientType,'personal'>){
  const cleanName=name.trim(),cleanLink=link.trim();if(!cleanName){setStatus('Name enter करा.');return}
  if(type==='group'&&cleanLink&&!cleanLink.includes('chat.whatsapp.com')){setStatus('Valid WhatsApp group invite link तपासा.');return}
  if(type==='channel'&&cleanLink&&!cleanLink.includes('whatsapp.com/channel')){setStatus('Valid WhatsApp channel link तपासा.');return}
  const permissionStatus=type==='group'?(canSend==='yes'?'verified':canSend==='no'?'adminOnly':'unknown'):undefined
  if(await saveOne({name:cleanName,type,link:cleanLink||undefined,category,area:area.trim()||undefined,canSend:type==='group'?canSend==='yes':true,permissionStatus})){
   setName('');setLink('');setArea('');setCategory('Other');setCanSend('unknown')
  }
 }

 return <main className="connect-shell"><section className="connect-card import-card">
  <div className="eyebrow">STEP 2</div><h1>Import from WhatsApp</h1>
  <p className="connect-lead">Imported recipients आता Supabase cloud database मध्ये save होतात.</p>
  {mode==='home'?<><div className="import-grid">
   <button className="import-option" onClick={()=>setMode('personal')}><span className="import-icon"><Contact size={28}/></span><span><b>Personal Contacts</b><small>Phone contact picker</small></span><ArrowRight size={20}/></button>
   <button className="import-option" onClick={()=>setMode('group')}><span className="import-icon"><Users size={28}/></span><span><b>Groups</b><small>WhatsApp invite link assisted import</small></span><ArrowRight size={20}/></button>
   <button className="import-option" onClick={()=>setMode('community')}><span className="import-icon"><UsersRound size={28}/></span><span><b>Communities</b><small>Name + share/invite info</small></span><ArrowRight size={20}/></button>
   <button className="import-option" onClick={()=>setMode('channel')}><span className="import-icon"><Radio size={28}/></span><span><b>Channels</b><small>WhatsApp Channel link</small></span><ArrowRight size={20}/></button>
  </div><div className="info-note">Cloud master: <b>{savedCount}</b> recipients · Source: <b>{source}</b></div></>:<div className="assist-panel">
   <button className="secondary" onClick={()=>{setMode('home');setStatus('')}}>← Back</button>
   <div className="assist-head"><span className="import-icon">{mode==='personal'?<Contact size={28}/>:mode==='group'?<Users size={28}/>:mode==='community'?<UsersRound size={28}/>:<Radio size={28}/>}</span><div><h2>{selected?.title}</h2><p>{selected?.desc}</p></div></div>
   {mode==='personal'?<><button className="primary connect-primary" onClick={pickContacts}><Contact size={19}/> Select Contacts from Phone</button></>:<>
    <button className="secondary connect-primary" onClick={openWhatsApp}><MessageCircleMore size={19}/> Open WhatsApp</button>
    <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder={`${selected?.title} name`}/></label>
    <label><Link2 size={15}/> WhatsApp link<input value={link} onChange={e=>setLink(e.target.value)} placeholder={selected?.placeholder}/></label>
    <div className="two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Other</option><option>News</option><option>Political</option><option>Media</option><option>Jobs</option><option>Business</option><option>Health</option></select></label><label>Area<input value={area} onChange={e=>setArea(e.target.value)} placeholder="Sakoli / Gondia"/></label></div>
    {mode==='group'&&<div className="permission-box"><b>Can you send messages in this group?</b><div className="choice-row"><button className={canSend==='yes'?'choice yes selected':'choice yes'} onClick={()=>setCanSend('yes')}>Yes</button><button className={canSend==='no'?'choice no selected':'choice no'} onClick={()=>setCanSend('no')}>No, admin only</button></div><button className="secondary fullbtn" onClick={()=>setCanSend('unknown')}>Permission unknown</button></div>}
    <button className="primary connect-primary" onClick={()=>void saveAssisted(mode as Exclude<RecipientType,'personal'>)}><CheckCircle2 size={19}/> Save to Recipient Master</button>
   </>}
  </div>}
  {status&&<div className="notice"><CheckCircle2 size={19}/><div><b>{status}</b><span>Cloud Recipient Master मध्ये save झाले.</span></div></div>}
  <button className="primary connect-primary" onClick={()=>location.href='/recipients'}>Go to Recipient Master <ArrowRight size={19}/></button>
  <div className="official-note"><ExternalLink size={17}/><span>हा flow WhatsApp session scrape करत नाही.</span></div>
 </section></main>
}

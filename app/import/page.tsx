'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Contact, ExternalLink, Link2, MessageCircleMore, Radio, Users, UsersRound } from 'lucide-react'

type RecipientType='personal'|'group'|'community'|'channel'
type Source='WhatsApp'|'WhatsApp Business'
type Recipient={id:string,name:string,type:RecipientType,source:Source,phone?:string,category?:string,area?:string,canSend:boolean,link?:string}

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
 const source=(typeof window!=='undefined'?(localStorage.getItem('jb-wa-source') as Source):null)||'WhatsApp'
 const selected=mode==='home'?null:meta[mode]

 const savedCount=useMemo(()=>{
   if(typeof window==='undefined') return 0
   try{return (JSON.parse(localStorage.getItem('jb-recipients')||'[]') as Recipient[]).length}catch{return 0}
 },[status])

 function getAll(){try{return JSON.parse(localStorage.getItem('jb-recipients')||'[]') as Recipient[]}catch{return []}}
 function saveOne(r:Recipient){
   const old=getAll()
   const duplicate=old.some(x=>x.type===r.type&&x.source===r.source&&((r.phone&&x.phone===r.phone)||(r.link&&x.link===r.link)||(!r.phone&&!r.link&&x.name.toLowerCase()===r.name.toLowerCase())))
   if(duplicate){setStatus('हे recipient आधीच master मध्ये आहे.');return false}
   localStorage.setItem('jb-recipients',JSON.stringify([...old,r]));setStatus(`${r.name} imported successfully.`);return true
 }

 async function pickContacts(){
   const nav=navigator as Navigator & {contacts?:{select:(p:string[],o:{multiple:boolean})=>Promise<Array<{name?:string[],tel?:string[]}>>}}
   if(!nav.contacts?.select){setStatus('या browser मध्ये Contact Picker उपलब्ध नाही. Chrome Android वापरा किंवा contacts file import करा.');return}
   try{
     const picked=await nav.contacts.select(['name','tel'],{multiple:true})
     const old=getAll();let added=0
     for(const c of picked){const phone=c.tel?.[0];if(!phone)continue;const nm=c.name?.[0]||phone;if(old.some(x=>x.type==='personal'&&x.phone===phone&&x.source===source))continue;old.push({id:crypto.randomUUID(),name:nm,type:'personal',source,phone,canSend:true});added++}
     localStorage.setItem('jb-recipients',JSON.stringify(old));setStatus(`${added} contacts imported from device picker.`)
   }catch{setStatus('Contact selection cancelled.')}
 }

 function openWhatsApp(){window.open('https://web.whatsapp.com/','_blank','noopener,noreferrer')}

 function saveAssisted(type:Exclude<RecipientType,'personal'>){
   const cleanName=name.trim();const cleanLink=link.trim()
   if(!cleanName){setStatus('Name enter करा.');return}
   if(type==='group'&&cleanLink&&!cleanLink.includes('chat.whatsapp.com')){setStatus('Valid WhatsApp group invite link तपासा.');return}
   if(type==='channel'&&cleanLink&&!cleanLink.includes('whatsapp.com/channel')){setStatus('Valid WhatsApp channel link तपासा.');return}
   const r:Recipient={id:crypto.randomUUID(),name:cleanName,type,source,category,area:area.trim()||undefined,link:cleanLink||undefined,canSend:type==='group'?canSend==='yes':true}
   if(saveOne(r)){setName('');setLink('');setArea('');setCategory('Other');setCanSend('unknown')}
 }

 return <main className="connect-shell"><section className="connect-card import-card">
   <div className="eyebrow">STEP 2</div><h1>Import from WhatsApp</h1>
   <p className="connect-lead">Official WhatsApp account मधील पूर्ण group/community/channel list app ला थेट मिळत नाही. म्हणून येथे WhatsApp-assisted import वापरतो: WhatsApp मधून link/share info घेऊन master मध्ये save करा.</p>

   {mode==='home'?<>
     <div className="import-grid">
       <button className="import-option" onClick={()=>setMode('personal')}><span className="import-icon"><Contact size={28}/></span><span><b>Personal Contacts</b><small>Phone contact picker</small></span><ArrowRight size={20}/></button>
       <button className="import-option" onClick={()=>setMode('group')}><span className="import-icon"><Users size={28}/></span><span><b>Groups</b><small>WhatsApp invite link assisted import</small></span><ArrowRight size={20}/></button>
       <button className="import-option" onClick={()=>setMode('community')}><span className="import-icon"><UsersRound size={28}/></span><span><b>Communities</b><small>Name + share/invite info</small></span><ArrowRight size={20}/></button>
       <button className="import-option" onClick={()=>setMode('channel')}><span className="import-icon"><Radio size={28}/></span><span><b>Channels</b><small>WhatsApp Channel link</small></span><ArrowRight size={20}/></button>
     </div>
     <div className="info-note">Current master: <b>{savedCount}</b> recipients · Source: <b>{source}</b></div>
   </>:<div className="assist-panel">
     <button className="secondary" onClick={()=>{setMode('home');setStatus('')}}>← Back</button>
     <div className="assist-head"><span className="import-icon">{mode==='personal'?<Contact size={28}/>:mode==='group'?<Users size={28}/>:mode==='community'?<UsersRound size={28}/>:<Radio size={28}/>}</span><div><h2>{selected?.title}</h2><p>{selected?.desc}</p></div></div>

     {mode==='personal'?<>
       <button className="primary connect-primary" onClick={pickContacts}><Contact size={19}/> Select Contacts from Phone</button>
       <div className="info-note">Contact picker फक्त user ने निवडलेले contacts देतो. WhatsApp chat list स्वतःहून read केली जात नाही.</div>
     </>:<>
       <button className="secondary connect-primary" onClick={openWhatsApp}><MessageCircleMore size={19}/> Open WhatsApp</button>
       <div className="assist-steps"><b>WhatsApp मध्ये:</b><span>1. {mode==='group'?'Group':mode==='community'?'Community':'Channel'} उघडा</span><span>2. Share / Invite link copy करा</span><span>3. खाली paste करून Save करा</span></div>
       <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder={`${selected?.title} name`}/></label>
       <label><Link2 size={15}/> WhatsApp link<input value={link} onChange={e=>setLink(e.target.value)} placeholder={selected?.placeholder}/></label>
       <div className="two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Other</option><option>News</option><option>Political</option><option>Media</option><option>Jobs</option><option>Business</option><option>Health</option></select></label><label>Area<input value={area} onChange={e=>setArea(e.target.value)} placeholder="Sakoli / Gondia"/></label></div>
       {mode==='group'&&<div className="permission-box"><b>Can you send messages in this group?</b><div className="choice-row"><button className={canSend==='yes'?'choice yes selected':'choice yes'} onClick={()=>setCanSend('yes')}>Yes</button><button className={canSend==='no'?'choice no selected':'choice no'} onClick={()=>setCanSend('no')}>No, admin only</button></div><button className="secondary fullbtn" onClick={()=>setCanSend('unknown')}>Permission unknown</button></div>}
       <button className="primary connect-primary" onClick={()=>saveAssisted(mode as Exclude<RecipientType,'personal'>)}><CheckCircle2 size={19}/> Save to Recipient Master</button>
     </>}
   </div>}

   {status&&<div className="notice"><CheckCircle2 size={19}/><div><b>{status}</b><span>Recipient Master मध्ये changes save झाले आहेत.</span></div></div>}
   <button className="primary connect-primary" onClick={()=>window.location.href='/'}>Go to Recipient Master <ArrowRight size={19}/></button>
   <div className="official-note"><ExternalLink size={17}/><span>हा flow WhatsApp Web session scrape करत नाही आणि WhatsApp login credentials store करत नाही.</span></div>
 </section></main>
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, MessageCircleMore, Send, Users } from 'lucide-react'

type Source='WhatsApp'|'WhatsApp Business'
type RecipientType='personal'|'group'|'community'|'channel'
type Recipient={id:string,name:string,type:RecipientType,source:Source,phone?:string,category?:string,area?:string,canSend:boolean,link?:string}

export default function CampaignPage(){
 const [recipients,setRecipients]=useState<Recipient[]>([])
 const [source,setSource]=useState<Source>('WhatsApp')
 const [title,setTitle]=useState('')
 const [message,setMessage]=useState('')
 const [selected,setSelected]=useState<string[]>([])
 const [done,setDone]=useState<string[]>([])
 const [query,setQuery]=useState('')
 useEffect(()=>{setRecipients(JSON.parse(localStorage.getItem('jb-recipients')||'[]'));setSource((localStorage.getItem('jb-wa-source') as Source)||'WhatsApp')},[])
 const eligible=useMemo(()=>recipients.filter(r=>r.source===source&&r.canSend&&(!query||r.name.toLowerCase().includes(query.toLowerCase()))),[recipients,source,query])
 const chosen=recipients.filter(r=>selected.includes(r.id)&&r.canSend)
 function toggle(id:string){setSelected(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id])}
 function destination(r:Recipient){
   const text=encodeURIComponent(message)
   if(r.type==='personal'&&r.phone){const n=r.phone.replace(/\D/g,'');return `https://wa.me/${n}?text=${text}`}
   if(r.link){return r.link}
   return 'https://web.whatsapp.com/'
 }
 function openRecipient(r:Recipient){window.open(destination(r),'_blank','noopener,noreferrer')}
 function markDone(id:string){setDone(x=>x.includes(id)?x:[...x,id])}
 return <main className="shell">
  <header className="topbar"><div><div className="eyebrow">JB DIGITAL · CAMPAIGN</div><h1>Assisted WhatsApp Sender</h1><div className="source-line">Source: {source}</div></div><button className="secondary" onClick={()=>location.href='/'}><ArrowLeft size={18}/> Manager</button></header>
  <div className="notice"><MessageCircleMore size={20}/><div><b>User-confirmed sending</b><span>प्रत्येक recipient साठी WhatsApp उघडेल. Message तपासून Send तुम्ही WhatsApp मध्ये कराल.</span></div></div>
  <section className="campaign-grid">
   <div className="panel"><h2><Send size={20}/> Campaign</h2><label>Campaign title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="उदा. आजची बातमी"/></label><label>Message<textarea rows={9} value={message} onChange={e=>setMessage(e.target.value)} placeholder="WhatsApp message लिहा..."/></label><p className="muted">Selected: {selected.length} · Completed: {done.length}</p></div>
   <div className="panel"><h2><Users size={20}/> Select recipients</h2><label>Search<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..."/></label><div className="selector-list">{eligible.map(r=><label className="checkrow" key={r.id}><input type="checkbox" checked={selected.includes(r.id)} onChange={()=>toggle(r.id)}/><span><b>{r.name}</b><small>{r.type} · {r.phone||r.area||'saved recipient'}</small></span></label>)}</div></div>
   <div className="panel full"><h2>Send Queue</h2>{chosen.length===0?<p className="muted">Recipients select केल्यावर queue येथे दिसेल.</p>:chosen.map((r,i)=><div className="batch" key={r.id}><div><b>{i+1}. {r.name}</b><span>{r.type}{done.includes(r.id)?' · Completed':''}</span></div><div className="toolbar-actions"><button className="secondary" onClick={()=>openRecipient(r)}><ExternalLink size={17}/> Open WhatsApp</button><button className="primary" disabled={done.includes(r.id)} onClick={()=>markDone(r.id)}><CheckCircle2 size={17}/> {done.includes(r.id)?'Done':'Mark Sent'}</button></div></div>)}</div>
  </section>
 </main>
}

'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Contact, History, Import, LogOut, Megaphone, Radio, Users, UsersRound } from 'lucide-react'

type RecipientType='personal'|'group'|'community'|'channel'
type Recipient={id:string,name:string,type:RecipientType,canSend:boolean}
type CampaignHistory={id:string,title:string,status?:string,selectedIds?:string[],doneIds?:string[]}

type Source='WhatsApp'|'WhatsApp Business'

export default function Dashboard(){
 const [recipients,setRecipients]=useState<Recipient[]>([])
 const [history,setHistory]=useState<CampaignHistory[]>([])
 const [source,setSource]=useState<Source|'Not selected'>('Not selected')
 useEffect(()=>{
  setRecipients(JSON.parse(localStorage.getItem('jb-recipients')||'[]'))
  setHistory(JSON.parse(localStorage.getItem('jb-campaign-history')||'[]'))
  setSource((localStorage.getItem('jb-wa-source') as Source)||'Not selected')
 },[])
 function changeAccount(){
  localStorage.removeItem('jb-wa-source')
  document.cookie='jb-wa-connected=; Path=/; Max-Age=0; SameSite=Lax'
  location.href='/connect'
 }
 const personal=recipients.filter(r=>r.type==='personal').length
 const groups=recipients.filter(r=>r.type==='group').length
 const communities=recipients.filter(r=>r.type==='community').length
 const channels=recipients.filter(r=>r.type==='channel').length
 const completed=history.filter(h=>h.status==='Completed').length
 const active=history.filter(h=>h.status==='In-progress').length
 const cards=[
  {title:'Import from WhatsApp',desc:'Contacts, Groups, Communities आणि Channels import करा.',href:'/import',icon:<Import size={28}/>},
  {title:'Recipient Master',desc:'Edit, delete, duplicate cleanup आणि permissions manage करा.',href:'/recipients',icon:<Users size={28}/>},
  {title:'Create Campaign',desc:'Recipients निवडा आणि assisted WhatsApp sending सुरू करा.',href:'/campaign',icon:<Megaphone size={28}/>},
  {title:'Campaign History',desc:'Draft, in-progress आणि completed campaigns पहा.',href:'/campaign#history',icon:<History size={28}/>},
 ]
 return <main className="shell">
  <header className="topbar"><div><div className="eyebrow">JB DIGITAL</div><h1>WhatsApp CRM Dashboard</h1><div className="source-line">Connected workspace: {source}</div></div><div className="toolbar-actions"><button className="secondary" onClick={changeAccount}><LogOut size={18}/> Change WhatsApp</button><div className="wa-dot">WA</div></div></header>
  <section className="stats">
   <Stat icon={<Contact size={20}/>} label="Personal" value={personal}/>
   <Stat icon={<Users size={20}/>} label="Groups" value={groups}/>
   <Stat icon={<UsersRound size={20}/>} label="Communities" value={communities}/>
   <Stat icon={<Radio size={20}/>} label="Channels" value={channels}/>
  </section>
  <section className="campaign-grid">
   {cards.map(c=><button key={c.href} className="panel" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>location.href=c.href}><div className="group-title"><div className="import-icon">{c.icon}</div><ArrowRight size={20}/></div><h2>{c.title}</h2><p className="muted">{c.desc}</p></button>)}
   <div className="panel full"><h2>Campaign Summary</h2><div className="stats"><Stat label="Total" value={history.length}/><Stat label="In Progress" value={active}/><Stat label="Completed" value={completed}/></div></div>
  </section>
 </main>
}

function Stat({label,value,icon}:{label:string,value:number,icon?:React.ReactNode}){return <div className="stat"><div>{icon}<strong>{value}</strong><span>{label}</span></div></div>}

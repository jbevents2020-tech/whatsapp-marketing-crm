'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, Contact, History, Import, LogOut, Megaphone, Radio, Users, UsersRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type RecipientType='personal'|'group'|'community'|'channel'
type Recipient={id:string,name:string,type:RecipientType,source?:'WhatsApp'|'WhatsApp Business',phone?:string,link?:string,category?:string,area?:string,canSend:boolean,permissionStatus?:'verified'|'adminOnly'|'unknown'}
type CampaignHistory={id:string,title:string,message?:string,status?:string,selectedIds?:string[],doneIds?:string[]}
type Source='WhatsApp'|'WhatsApp Business'

export default function Dashboard(){
 const [recipients,setRecipients]=useState<Recipient[]>([])
 const [history,setHistory]=useState<CampaignHistory[]>([])
 const [source,setSource]=useState<Source|'Not selected'>('Not selected')
 const [email,setEmail]=useState('')
 const [syncState,setSyncState]=useState('Checking cloud...')

 useEffect(()=>{
  async function boot(){
   if(!supabase){ location.href='/login'; return }
   const {data:{session}}=await supabase.auth.getSession()
   if(!session){ location.href='/login'; return }
   setEmail(session.user.email||'')
   const userId=session.user.id
   const localRecipients:Recipient[]=JSON.parse(localStorage.getItem('jb-recipients')||'[]')
   const localHistory:CampaignHistory[]=JSON.parse(localStorage.getItem('jb-campaign-history')||'[]')

   const {data:cloudRecipients}=await supabase.from('recipients').select('*').order('created_at',{ascending:true})
   if((cloudRecipients?.length||0)===0 && localRecipients.length){
    const payload=localRecipients.map(r=>({
      user_id:userId,name:r.name,recipient_type:r.type,whatsapp_source:r.source||((localStorage.getItem('jb-wa-source') as Source)||'WhatsApp'),phone:r.phone||null,link:r.link||null,category:r.category||null,area:r.area||null,can_send:r.canSend!==false,permission_status:r.permissionStatus||null
    }))
    await supabase.from('recipients').insert(payload)
   }
   const {data:cloudCampaigns}=await supabase.from('campaigns').select('*').order('created_at',{ascending:false})
   if((cloudCampaigns?.length||0)===0 && localHistory.length){
    const payload=localHistory.map(h=>({user_id:userId,title:h.title||'Campaign',message:h.message||'',status:['Draft','In-progress','Completed'].includes(h.status||'')?h.status:'Draft',selected_ids:[],done_ids:[]}))
    await supabase.from('campaigns').insert(payload)
   }

   const {data:finalRecipients}=await supabase.from('recipients').select('*').order('created_at',{ascending:true})
   const {data:finalCampaigns}=await supabase.from('campaigns').select('*').order('created_at',{ascending:false})
   setRecipients((finalRecipients||[]).map((r:any)=>({id:r.id,name:r.name,type:r.recipient_type,source:r.whatsapp_source,phone:r.phone,link:r.link,category:r.category,area:r.area,canSend:r.can_send,permissionStatus:r.permission_status})))
   setHistory((finalCampaigns||[]).map((h:any)=>({id:h.id,title:h.title,message:h.message,status:h.status,selectedIds:h.selected_ids||[],doneIds:h.done_ids||[]})))
   setSource((localStorage.getItem('jb-wa-source') as Source)||'Not selected')
   localStorage.setItem('jb-cloud-migrated','1')
   setSyncState('Cloud connected')
  }
  boot()
 },[])

 async function logout(){
  if(supabase) await supabase.auth.signOut()
  location.href='/login'
 }
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
  <header className="topbar"><div><div className="eyebrow">JB DIGITAL</div><h1>WhatsApp CRM Dashboard</h1><div className="source-line">{syncState} · {email||'Signed in'} · Workspace: {source}</div></div><div className="toolbar-actions"><button className="secondary" onClick={changeAccount}><LogOut size={18}/> Change WhatsApp</button><button className="secondary" onClick={logout}>Logout</button><div className="wa-dot">WA</div></div></header>
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

function Stat({label,value,icon}:{label:string,value:number,icon?:ReactNode}){return <div className="stat"><div>{icon}<strong>{value}</strong><span>{label}</span></div></div>}

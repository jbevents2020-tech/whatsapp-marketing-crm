'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Contact, History, Import, LogOut, Megaphone, Radio, RefreshCw, Users, UsersRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type RecipientType='personal'|'group'|'community'|'channel'
type Recipient={id:string,name:string,type:RecipientType,source?:'WhatsApp'|'WhatsApp Business',phone?:string,link?:string,category?:string,area?:string,canSend:boolean,permissionStatus?:'verified'|'adminOnly'|'unknown'}
type CampaignHistory={id:string,title:string,message?:string,status?:string,selectedIds?:string[],doneIds?:string[]}
type Source='WhatsApp'|'WhatsApp Business'
type SyncStatus='checking'|'syncing'|'connected'|'error'

export default function Dashboard(){
 const [recipients,setRecipients]=useState<Recipient[]>([])
 const [history,setHistory]=useState<CampaignHistory[]>([])
 const [source,setSource]=useState<Source|'Not selected'>('Not selected')
 const [email,setEmail]=useState('')
 const [syncStatus,setSyncStatus]=useState<SyncStatus>('checking')
 const [syncMessage,setSyncMessage]=useState('Checking cloud...')
 const [lastSync,setLastSync]=useState<Date|null>(null)

 const loadCloud=useCallback(async (migrate=false)=>{
  if(!supabase){setSyncStatus('error');setSyncMessage('Supabase environment variables are missing.');return}
  setSyncStatus('syncing');setSyncMessage('Syncing cloud data...')
  try{
   const {data:{session},error:sessionError}=await supabase.auth.getSession()
   if(sessionError) throw sessionError
   if(!session){location.href='/login';return}
   setEmail(session.user.email||'')
   const userId=session.user.id

   if(migrate){
    const localRecipients:Recipient[]=JSON.parse(localStorage.getItem('jb-recipients')||'[]')
    const localHistory:CampaignHistory[]=JSON.parse(localStorage.getItem('jb-campaign-history')||'[]')
    const {data:cloudRecipients,error:recipientCheckError}=await supabase.from('recipients').select('id').limit(1)
    if(recipientCheckError) throw recipientCheckError
    if((cloudRecipients?.length||0)===0&&localRecipients.length){
     const payload=localRecipients.map(r=>({user_id:userId,name:r.name,recipient_type:r.type,whatsapp_source:r.source||((localStorage.getItem('jb-wa-source') as Source)||'WhatsApp'),phone:r.phone||null,link:r.link||null,category:r.category||null,area:r.area||null,can_send:r.canSend!==false,permission_status:r.permissionStatus||null}))
     const {error}=await supabase.from('recipients').insert(payload);if(error)throw error
    }
    const {data:cloudCampaigns,error:campaignCheckError}=await supabase.from('campaigns').select('id').limit(1)
    if(campaignCheckError) throw campaignCheckError
    if((cloudCampaigns?.length||0)===0&&localHistory.length){
     const payload=localHistory.map(h=>({user_id:userId,title:h.title||'Campaign',message:h.message||'',status:['Draft','In-progress','Completed'].includes(h.status||'')?h.status:'Draft',selected_ids:[],done_ids:[]}))
     const {error}=await supabase.from('campaigns').insert(payload);if(error)throw error
    }
   }

   const [recipientResult,campaignResult]=await Promise.all([
    supabase.from('recipients').select('*').order('created_at',{ascending:true}),
    supabase.from('campaigns').select('*').order('created_at',{ascending:false})
   ])
   if(recipientResult.error)throw recipientResult.error
   if(campaignResult.error)throw campaignResult.error
   setRecipients((recipientResult.data||[]).map((r:any)=>({id:r.id,name:r.name,type:r.recipient_type,source:r.whatsapp_source,phone:r.phone,link:r.link,category:r.category,area:r.area,canSend:r.can_send,permissionStatus:r.permission_status})))
   setHistory((campaignResult.data||[]).map((h:any)=>({id:h.id,title:h.title,message:h.message,status:h.status,selectedIds:h.selected_ids||[],doneIds:h.done_ids||[]})))
   setSource((localStorage.getItem('jb-wa-source') as Source)||'Not selected')
   if(migrate)localStorage.setItem('jb-cloud-migrated','1')
   setLastSync(new Date());setSyncStatus('connected');setSyncMessage('Cloud connected')
  }catch(error){
   console.error(error);setSyncStatus('error');setSyncMessage(error instanceof Error?error.message:'Cloud sync failed. Please try again.')
  }
 },[])

 useEffect(()=>{loadCloud(true)},[loadCloud])

 async function logout(){if(supabase)await supabase.auth.signOut();location.href='/login'}
 function changeAccount(){localStorage.removeItem('jb-wa-source');document.cookie='jb-wa-connected=; Path=/; Max-Age=0; SameSite=Lax';location.href='/connect'}
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
  <header className="topbar"><div><div className="eyebrow">JB DIGITAL</div><h1>WhatsApp CRM Dashboard</h1><div className="source-line">{email||'Signed in'} · Workspace: {source}</div></div><div className="toolbar-actions"><button className="secondary" onClick={changeAccount}><LogOut size={18}/> Change WhatsApp</button><button className="secondary" onClick={logout}>Logout</button><div className="wa-dot">WA</div></div></header>
  <div className={syncStatus==='error'?'sync-banner error-sync':'sync-banner'}>
   <div className="sync-main">{syncStatus==='error'?<AlertTriangle size={20}/>:<CheckCircle2 size={20}/>}<div><b>{syncMessage}</b><span>{lastSync?`Last sync: ${lastSync.toLocaleTimeString()}`:'Connecting to Supabase...'}</span></div></div>
   <button className="secondary" disabled={syncStatus==='syncing'} onClick={()=>loadCloud(false)}><RefreshCw size={17} className={syncStatus==='syncing'?'spin':''}/> {syncStatus==='syncing'?'Syncing':'Refresh'}</button>
  </div>
  <section className="stats"><Stat icon={<Contact size={20}/>} label="Personal" value={personal}/><Stat icon={<Users size={20}/>} label="Groups" value={groups}/><Stat icon={<UsersRound size={20}/>} label="Communities" value={communities}/><Stat icon={<Radio size={20}/>} label="Channels" value={channels}/></section>
  <section className="campaign-grid">{cards.map(c=><button key={c.href} className="panel" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>location.href=c.href}><div className="group-title"><div className="import-icon">{c.icon}</div><ArrowRight size={20}/></div><h2>{c.title}</h2><p className="muted">{c.desc}</p></button>)}<div className="panel full"><h2>Campaign Summary</h2><div className="stats"><Stat label="Total" value={history.length}/><Stat label="In Progress" value={active}/><Stat label="Completed" value={completed}/></div></div></section>
 </main>
}
function Stat({label,value,icon}:{label:string,value:number,icon?:ReactNode}){return <div className="stat"><div>{icon}<strong>{value}</strong><span>{label}</span></div></div>}

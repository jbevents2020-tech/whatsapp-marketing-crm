'use client'

import { useEffect, useMemo, useState } from 'react'
import { Ban, BriefcaseBusiness, CheckCircle2, Contact, Layers3, Megaphone, MessageCircleMore, Plus, Radio, Search, ShieldAlert, Users, UsersRound } from 'lucide-react'

type Source = 'WhatsApp' | 'WhatsApp Business'
type RecipientType = 'personal' | 'group' | 'community' | 'channel'
type Recipient = {
  id: string
  name: string
  type: RecipientType
  source: Source
  phone?: string
  category?: string
  area?: string
  canSend: boolean
}

type Campaign = {
  title: string
  message: string
  selectedIds: string[]
  batchSize: number
  intervalMinutes: number
}

const starter: Recipient[] = [
  { id:'g1', name:'Sakoli News 01', type:'group', source:'WhatsApp Business', category:'News', area:'Sakoli', canSend:true },
  { id:'g2', name:'Arjuni Updates', type:'group', source:'WhatsApp', category:'Political', area:'Arjuni Morgaon', canSend:true },
]

const labels: Record<RecipientType,string> = { personal:'Personal', group:'Groups', community:'Communities', channel:'Channels' }

export default function Home(){
  const [source,setSource] = useState<Source | null>(null)
  const [remember,setRemember] = useState(true)
  const [recipients,setRecipients] = useState<Recipient[]>(starter)
  const [masterTab,setMasterTab] = useState<RecipientType>('group')
  const [pageTab,setPageTab] = useState<'master'|'campaign'>('master')
  const [query,setQuery] = useState('')
  const [showAdd,setShowAdd] = useState(false)
  const [campaign,setCampaign] = useState<Campaign>({ title:'आजची बातमी', message:'', selectedIds:[], batchSize:5, intervalMinutes:10 })

  useEffect(()=>{
    const savedSource = localStorage.getItem('jb-wa-source') as Source | null
    const savedRecipients = localStorage.getItem('jb-recipients')
    if(savedSource) setSource(savedSource)
    if(savedRecipients) setRecipients(JSON.parse(savedRecipients))
  },[])

  useEffect(()=>{ localStorage.setItem('jb-recipients',JSON.stringify(recipients)) },[recipients])

  const visible = useMemo(()=> recipients.filter(r => r.type===masterTab && (!source || r.source===source) && (!query || [r.name,r.phone,r.category,r.area].filter(Boolean).some(v=>String(v).toLowerCase().includes(query.toLowerCase())))),[recipients,masterTab,source,query])
  const eligible = recipients.filter(r=>r.canSend && (!source || r.source===source))
  const selected = eligible.filter(r=>campaign.selectedIds.includes(r.id))
  const batches: Recipient[][] = []
  for(let i=0;i<selected.length;i+=campaign.batchSize) batches.push(selected.slice(i,i+campaign.batchSize))

  function chooseSource(s:Source){ setSource(s); if(remember) localStorage.setItem('jb-wa-source',s) }
  function changeSource(){ localStorage.removeItem('jb-wa-source'); setSource(null) }
  function toggle(id:string){ setCampaign(c=>({...c,selectedIds:c.selectedIds.includes(id)?c.selectedIds.filter(x=>x!==id):[...c.selectedIds,id]})) }

  async function importContacts(){
    const nav = navigator as Navigator & { contacts?: { select:(props:string[],opts:{multiple:boolean})=>Promise<Array<{name?:string[],tel?:string[]}>> } }
    if(!nav.contacts?.select){ alert('या browser मध्ये Contact Picker उपलब्ध नाही. Personal contact manually add करा.'); return }
    try{
      const picked = await nav.contacts.select(['name','tel'],{multiple:true})
      const fresh: Recipient[] = picked.flatMap((c,i)=> (c.tel||[]).slice(0,1).map(t=>({id:crypto.randomUUID(),name:c.name?.[0]||t,type:'personal' as const,source:source||'WhatsApp',phone:t,canSend:true})))
      setRecipients(r=>[...r,...fresh])
    }catch{}
  }

  return <main className="shell">
    {!source && <SourceModal remember={remember} setRemember={setRemember} onChoose={chooseSource}/>} 

    <header className="topbar">
      <div><div className="eyebrow">JB DIGITAL</div><h1>WhatsApp Distribution Manager</h1><div className="source-line">{source || 'Choose WhatsApp'} {source && <button onClick={changeSource}>Change</button>}</div></div>
      <div className="wa-dot">WA</div>
    </header>

    <section className="stats">
      <Stat label="Personal" value={recipients.filter(r=>r.type==='personal'&&(!source||r.source===source)).length}/>
      <Stat label="Groups" value={recipients.filter(r=>r.type==='group'&&r.canSend&&(!source||r.source===source)).length}/>
      <Stat label="Community + Channel" value={recipients.filter(r=>(r.type==='community'||r.type==='channel')&&(!source||r.source===source)).length}/>
    </section>

    <nav className="tabs"><button className={pageTab==='master'?'active':''} onClick={()=>setPageTab('master')}>Recipient Master</button><button className={pageTab==='campaign'?'active':''} onClick={()=>setPageTab('campaign')}>Campaign Queue</button></nav>

    {pageTab==='master' ? <>
      <div className="type-tabs">
        {(['personal','group','community','channel'] as RecipientType[]).map(t=><button key={t} className={masterTab===t?'active':''} onClick={()=>setMasterTab(t)}>{iconFor(t)} {labels[t]}</button>)}
      </div>
      <div className="toolbar">
        <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${labels[masterTab].toLowerCase()}`}/></div>
        <div className="toolbar-actions">{masterTab==='personal'&&<button className="secondary" onClick={importContacts}><Contact size={18}/> Import Contacts</button>}<button className="primary" onClick={()=>setShowAdd(true)}><Plus size={18}/> Add {labels[masterTab]}</button></div>
      </div>

      {masterTab==='group' && <div className="notice"><ShieldAlert size={19}/><div><b>Admin-only protection is ON.</b><span>Only groups where you can send messages are kept active.</span></div></div>}
      {(masterTab==='group'||masterTab==='community'||masterTab==='channel') && <div className="info-note">WhatsApp currently does not expose an official public API for this web app to automatically read your full {labels[masterTab].toLowerCase()} list. Add/register them here once and they remain available in your master.</div>}

      <div className="cards">{visible.length===0?<div className="empty">No {labels[masterTab].toLowerCase()} added yet.</div>:visible.map(r=><article className="group-card" key={r.id}><div className="avatar">{r.name.slice(0,2).toUpperCase()}</div><div className="group-main"><div className="group-title"><h3>{r.name}</h3><span className="pill source-pill">{r.source==='WhatsApp Business'?'Business':'WhatsApp'}</span></div><p>{r.phone || [r.category,r.area].filter(Boolean).join(' · ') || labels[r.type]}</p><div className={r.canSend?'status ok':'status blocked'}>{r.canSend?<><CheckCircle2 size={15}/> Active</>:<><Ban size={15}/> Admin Only</>}</div></div></article>)}</div>
    </> : <section className="campaign-grid">
      <div className="panel"><h2><Megaphone size={21}/> Create Campaign</h2><label>Campaign title<input value={campaign.title} onChange={e=>setCampaign(c=>({...c,title:e.target.value}))}/></label><label>Message<textarea rows={7} value={campaign.message} onChange={e=>setCampaign(c=>({...c,message:e.target.value}))}/></label><div className="two-col"><label>Batch size<input type="number" min={1} max={5} value={campaign.batchSize} onChange={e=>setCampaign(c=>({...c,batchSize:Math.min(5,Math.max(1,Number(e.target.value)))}))}/></label><label>Gap (minutes)<input type="number" min={1} value={campaign.intervalMinutes} onChange={e=>setCampaign(c=>({...c,intervalMinutes:Math.max(1,Number(e.target.value))}))}/></label></div></div>
      <div className="panel"><h2><Users size={21}/> Select Recipients</h2><p className="muted">Source: {source}</p><div className="selector-list">{eligible.map(r=><label className="checkrow" key={r.id}><input type="checkbox" checked={campaign.selectedIds.includes(r.id)} onChange={()=>toggle(r.id)}/><span><b>{r.name}</b><small>{labels[r.type]} · {r.source}</small></span></label>)}</div></div>
      <div className="panel full"><h2><Layers3 size={21}/> Delivery Queue</h2>{batches.length===0?<p className="muted">Select recipients to generate batches.</p>:batches.map((b,i)=><div className="batch" key={i}><div><b>Batch {i+1}</b><span>{b.length} recipients · then wait {campaign.intervalMinutes} min</span></div><div className="chips">{b.map(r=><span key={r.id}>{r.name}</span>)}</div></div>)}</div>
    </section>}

    {showAdd && <AddRecipientModal type={masterTab} source={source||'WhatsApp'} onClose={()=>setShowAdd(false)} onAdd={r=>{setRecipients(x=>[...x,r]);setShowAdd(false)}}/>}
  </main>
}

function iconFor(t:RecipientType){ if(t==='personal')return <Contact size={17}/>; if(t==='group')return <Users size={17}/>; if(t==='community')return <UsersRound size={17}/>; return <Radio size={17}/> }
function Stat({label,value}:{label:string,value:number}){return <div className="stat"><div><strong>{value}</strong><span>{label}</span></div></div>}

function SourceModal({remember,setRemember,onChoose}:{remember:boolean,setRemember:(v:boolean)=>void,onChoose:(s:Source)=>void}){
  return <div className="modal-wrap"><div className="modal source-modal"><div className="eyebrow">WELCOME</div><h2>Which WhatsApp do you want to use?</h2><p className="muted">Choose the account used for this campaign workspace.</p><button className="source-card" onClick={()=>onChoose('WhatsApp Business')}><BriefcaseBusiness size={24}/><span><b>WhatsApp Business</b><small>Business groups, contacts and saved recipients</small></span></button><button className="source-card" onClick={()=>onChoose('WhatsApp')}><MessageCircleMore size={24}/><span><b>WhatsApp</b><small>Personal WhatsApp groups and contacts</small></span></button><label className="remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Remember my choice</label></div></div>
}

function AddRecipientModal({type,source,onClose,onAdd}:{type:RecipientType,source:Source,onClose:()=>void,onAdd:(r:Recipient)=>void}){
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [category,setCategory]=useState('News'); const [area,setArea]=useState(''); const [canSend,setCanSend]=useState<boolean|null>(type==='group'?null:true)
  const valid=name.trim() && (type!=='personal'||phone.trim()) && (type!=='group'||canSend===true)
  return <div className="modal-wrap" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-head"><div><div className="eyebrow">{labels[type].toUpperCase()} MASTER</div><h2>Add {labels[type]}</h2></div><button className="iconbtn" onClick={onClose}>×</button></div><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder={`Enter ${labels[type].toLowerCase()} name`}/></label>{type==='personal'?<label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91..."/></label>:<div className="two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>News</option><option>Political</option><option>Media</option><option>Jobs</option><option>Business</option><option>Health</option><option>Other</option></select></label><label>Area<input value={area} onChange={e=>setArea(e.target.value)} placeholder="Sakoli"/></label></div>}{type==='group'&&<div className="permission-box"><b>Can you send messages in this group?</b><p>If WhatsApp shows “Only admins can send messages”, choose No.</p><div className="choice-row"><button className={canSend===true?'choice yes selected':'choice yes'} onClick={()=>setCanSend(true)}><CheckCircle2 size={18}/> Yes</button><button className={canSend===false?'choice no selected':'choice no'} onClick={()=>setCanSend(false)}><Ban size={18}/> No, admin only</button></div></div>}{type==='group'&&canSend===false&&<div className="error"><ShieldAlert size={19}/><div><b>This group cannot be added.</b><span>Admin-only groups are excluded from the active master.</span></div></div>}<button disabled={!valid} className="primary fullbtn" onClick={()=>valid&&onAdd({id:crypto.randomUUID(),name:name.trim(),type,source,phone:phone.trim()||undefined,category:type==='personal'?undefined:category,area:area.trim()||undefined,canSend:true})}><Plus size={18}/> Add to Master</button></div></div>
}

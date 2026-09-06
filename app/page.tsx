'use client'

import { useEffect, useMemo, useState } from 'react'
import { Ban, CheckCircle2, ChevronRight, Layers3, Megaphone, Plus, Search, ShieldAlert, Users } from 'lucide-react'

type Group = {
  id: string
  name: string
  category: string
  area: string
  priority: 'High' | 'Normal'
  canSend: boolean
}

type Campaign = {
  id: string
  title: string
  message: string
  selectedGroupIds: string[]
  batchSize: number
  intervalMinutes: number
}

const starterGroups: Group[] = [
  { id: 'g1', name: 'Sakoli News 01', category: 'News', area: 'Sakoli', priority: 'High', canSend: true },
  { id: 'g2', name: 'Arjuni Updates', category: 'Political', area: 'Arjuni Morgaon', priority: 'Normal', canSend: true },
  { id: 'g3', name: 'Gondia Media', category: 'Media', area: 'Gondia', priority: 'High', canSend: true },
]

export default function Home() {
  const [groups, setGroups] = useState<Group[]>(starterGroups)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState<'groups' | 'campaign'>('groups')
  const [campaign, setCampaign] = useState<Campaign>({
    id: 'c1',
    title: 'आजची बातमी',
    message: '',
    selectedGroupIds: [],
    batchSize: 5,
    intervalMinutes: 10,
  })

  useEffect(() => {
    const saved = localStorage.getItem('jb-groups')
    if (saved) setGroups(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('jb-groups', JSON.stringify(groups))
  }, [groups])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return groups.filter(g => !q || [g.name, g.category, g.area].some(v => v.toLowerCase().includes(q)))
  }, [groups, query])

  const batches = useMemo(() => {
    const selected = groups.filter(g => campaign.selectedGroupIds.includes(g.id) && g.canSend)
    const out: Group[][] = []
    for (let i = 0; i < selected.length; i += campaign.batchSize) out.push(selected.slice(i, i + campaign.batchSize))
    return out
  }, [campaign.selectedGroupIds, campaign.batchSize, groups])

  const toggleGroup = (id: string) => {
    setCampaign(c => ({
      ...c,
      selectedGroupIds: c.selectedGroupIds.includes(id)
        ? c.selectedGroupIds.filter(x => x !== id)
        : [...c.selectedGroupIds, id],
    }))
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">JB DIGITAL</div>
          <h1>WhatsApp Group Manager</h1>
        </div>
        <div className="wa-dot">WA</div>
      </header>

      <section className="stats">
        <Stat icon={<Users size={20}/>} label="Active Groups" value={groups.filter(g => g.canSend).length} />
        <Stat icon={<Ban size={20}/>} label="Blocked" value={groups.filter(g => !g.canSend).length} />
        <Stat icon={<Layers3 size={20}/>} label="Selected" value={campaign.selectedGroupIds.length} />
      </section>

      <nav className="tabs">
        <button className={tab === 'groups' ? 'active' : ''} onClick={() => setTab('groups')}>Group Master</button>
        <button className={tab === 'campaign' ? 'active' : ''} onClick={() => setTab('campaign')}>Campaign Queue</button>
      </nav>

      {tab === 'groups' ? (
        <section>
          <div className="toolbar">
            <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search group, area, category" /></div>
            <button className="primary" onClick={() => setShowAdd(true)}><Plus size={18}/> Add Group</button>
          </div>

          <div className="notice"><ShieldAlert size={19}/><div><b>Admin-only protection is ON.</b><span>Groups where you cannot send messages are blocked from being added to the active broadcast list.</span></div></div>

          <div className="cards">
            {filtered.map(g => (
              <article className="group-card" key={g.id}>
                <div className="avatar">{g.name.slice(0,2).toUpperCase()}</div>
                <div className="group-main">
                  <div className="group-title"><h3>{g.name}</h3>{g.priority === 'High' && <span className="pill high">High</span>}</div>
                  <p>{g.category} · {g.area}</p>
                  <div className={g.canSend ? 'status ok' : 'status blocked'}>{g.canSend ? <><CheckCircle2 size={15}/> Can Send</> : <><Ban size={15}/> Admin Only</>}</div>
                </div>
                <ChevronRight size={20}/>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="campaign-grid">
          <div className="panel">
            <h2><Megaphone size={21}/> Create Campaign</h2>
            <label>Campaign title<input value={campaign.title} onChange={e => setCampaign(c => ({...c, title: e.target.value}))}/></label>
            <label>Message<textarea rows={7} value={campaign.message} onChange={e => setCampaign(c => ({...c, message: e.target.value}))} placeholder="Type message / caption here..."/></label>
            <div className="two-col">
              <label>Batch size<input type="number" min={1} max={5} value={campaign.batchSize} onChange={e => setCampaign(c => ({...c, batchSize: Math.min(5, Math.max(1, Number(e.target.value))) }))}/></label>
              <label>Gap (minutes)<input type="number" min={1} value={campaign.intervalMinutes} onChange={e => setCampaign(c => ({...c, intervalMinutes: Math.max(1, Number(e.target.value)) }))}/></label>
            </div>
          </div>

          <div className="panel">
            <h2><Users size={21}/> Select Groups</h2>
            <p className="muted">Only send-enabled groups are available.</p>
            <div className="selector-list">
              {groups.filter(g => g.canSend).map(g => (
                <label className="checkrow" key={g.id}>
                  <input type="checkbox" checked={campaign.selectedGroupIds.includes(g.id)} onChange={() => toggleGroup(g.id)}/>
                  <span><b>{g.name}</b><small>{g.category} · {g.area}</small></span>
                </label>
              ))}
            </div>
          </div>

          <div className="panel full">
            <h2><Layers3 size={21}/> Delivery Queue</h2>
            {batches.length === 0 ? <p className="muted">Select groups to generate batches.</p> : batches.map((batch, index) => (
              <div className="batch" key={index}>
                <div><b>Batch {index + 1}</b><span>{batch.length} groups · then wait {campaign.intervalMinutes} min</span></div>
                <div className="chips">{batch.map(g => <span key={g.id}>{g.name}</span>)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showAdd && <AddGroupModal onClose={() => setShowAdd(false)} onAdd={(g) => { setGroups(prev => [...prev, g]); setShowAdd(false) }} />}
    </main>
  )
}

function Stat({icon,label,value}:{icon:React.ReactNode,label:string,value:number}) {
  return <div className="stat"><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>
}

function AddGroupModal({onClose,onAdd}:{onClose:()=>void,onAdd:(g:Group)=>void}) {
  const [name,setName] = useState('')
  const [category,setCategory] = useState('News')
  const [area,setArea] = useState('')
  const [priority,setPriority] = useState<'High'|'Normal'>('Normal')
  const [canSend,setCanSend] = useState<boolean | null>(null)
  const blocked = canSend === false
  const valid = name.trim() && area.trim() && canSend === true

  return <div className="modal-wrap" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="modal">
      <div className="modal-head"><div><div className="eyebrow">GROUP MASTER</div><h2>Add WhatsApp Group</h2></div><button className="iconbtn" onClick={onClose}>×</button></div>
      <label>Group name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sakoli News 02"/></label>
      <div className="two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>News</option><option>Political</option><option>Media</option><option>Jobs</option><option>Business</option><option>Health</option><option>Other</option></select></label><label>Area<input value={area} onChange={e=>setArea(e.target.value)} placeholder="Sakoli"/></label></div>
      <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as 'High'|'Normal')}><option>Normal</option><option>High</option></select></label>

      <div className="permission-box">
        <b>Can you send messages in this group?</b>
        <p>If WhatsApp shows “Only admins can send messages”, choose No.</p>
        <div className="choice-row">
          <button className={canSend === true ? 'choice yes selected' : 'choice yes'} onClick={()=>setCanSend(true)}><CheckCircle2 size={18}/> Yes, I can send</button>
          <button className={canSend === false ? 'choice no selected' : 'choice no'} onClick={()=>setCanSend(false)}><Ban size={18}/> No, admin only</button>
        </div>
      </div>

      {blocked && <div className="error"><ShieldAlert size={19}/><div><b>This group cannot be added.</b><span>Admin-only groups are excluded from the broadcast master list.</span></div></div>}

      <button disabled={!valid} className="primary fullbtn" onClick={() => valid && onAdd({id:crypto.randomUUID(), name:name.trim(), category, area:area.trim(), priority, canSend:true})}><Plus size={18}/> Add to Group Master</button>
    </div>
  </div>
}

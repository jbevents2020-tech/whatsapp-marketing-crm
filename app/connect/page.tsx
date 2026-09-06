'use client'

import { useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, ExternalLink, MessageCircleMore, QrCode, ShieldCheck } from 'lucide-react'

type Source = 'WhatsApp' | 'WhatsApp Business'

export default function ConnectPage(){
  const [source,setSource] = useState<Source>('WhatsApp Business')
  const [opened,setOpened] = useState(false)
  const [confirmed,setConfirmed] = useState(false)

  function openOfficialQr(){
    setOpened(true)
    window.open('https://web.whatsapp.com/','_blank','noopener,noreferrer')
  }

  function continueToApp(){
    if(!confirmed) return
    localStorage.setItem('jb-wa-source',source)
    document.cookie = 'jb-wa-connected=1; Path=/; Max-Age=2592000; SameSite=Lax'
    window.location.href='/'
  }

  return <main className="connect-shell">
    <section className="connect-card">
      <div className="connect-brand"><div className="connect-logo">WA</div><div><div className="eyebrow">JB DIGITAL</div><h1>Connect WhatsApp</h1></div></div>
      <p className="connect-lead">सर्वात आधी तुम्हाला कोणते WhatsApp वापरायचे आहे ते निवडा आणि official WhatsApp Web वर QR scan करून device link करा.</p>

      <div className="source-choice-grid">
        <button className={source==='WhatsApp Business'?'source-choice selected':'source-choice'} onClick={()=>setSource('WhatsApp Business')}><BriefcaseBusiness size={24}/><span><b>WhatsApp Business</b><small>Business account</small></span></button>
        <button className={source==='WhatsApp'?'source-choice selected':'source-choice'} onClick={()=>setSource('WhatsApp')}><MessageCircleMore size={24}/><span><b>WhatsApp</b><small>Personal account</small></span></button>
      </div>

      <div className="qr-panel">
        <QrCode size={44}/>
        <div><h2>Step 1 · QR Login</h2><p>खालील button दाबल्यावर official WhatsApp Web उघडेल. Phone मध्ये WhatsApp → Linked devices → Link a device → QR scan करा.</p></div>
      </div>

      <button className="primary connect-primary" onClick={openOfficialQr}><ExternalLink size={19}/> Open Official WhatsApp QR</button>

      <label className={opened?'confirm-link':'confirm-link disabled'}>
        <input type="checkbox" disabled={!opened} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
        <span><b>मी QR scan करून WhatsApp link केले आहे</b><small>ही confirmation फक्त onboarding पूर्ण करण्यासाठी आहे.</small></span>
      </label>

      <button className="primary connect-primary" disabled={!confirmed} onClick={continueToApp}><CheckCircle2 size={19}/> Continue to Manager</button>

      <div className="official-note"><ShieldCheck size={18}/><span>QR login official WhatsApp Web वरच होते. JB app तुमचा WhatsApp Web QR/session capture किंवा store करत नाही.</span></div>
    </section>
  </main>
}

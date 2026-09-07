'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)

  useEffect(()=>{
    if(!supabase) return
    supabase.auth.getSession().then(({data})=>{
      if(data.session) location.href='/dashboard'
    })
  },[])

  async function submit(e:FormEvent){
    e.preventDefault()
    if(!supabase){ setMessage('Supabase environment variables configure केलेले नाहीत.'); return }
    if(!email.trim()) return
    setLoading(true); setMessage('')
    const {error}=await supabase.auth.signInWithOtp({
      email:email.trim(),
      options:{ emailRedirectTo:`${location.origin}/dashboard` }
    })
    setLoading(false)
    setMessage(error ? error.message : 'Login link तुमच्या email वर पाठवली आहे. Email उघडून link वर tap करा.')
  }

  return <main className="shell">
    <section className="panel" style={{maxWidth:520,margin:'48px auto'}}>
      <div className="eyebrow">JB DIGITAL</div>
      <h1>WhatsApp CRM Login</h1>
      <p className="muted">Email magic link वापरून secure login करा.</p>
      {!isSupabaseConfigured && <div className="error">Supabase configuration missing.</div>}
      <form onSubmit={submit}>
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
        <button className="primary fullbtn" disabled={loading||!email.trim()}><Mail size={18}/>{loading?'Sending...':'Send Login Link'}</button>
      </form>
      {message && <div className="info-note" style={{marginTop:16}}>{message}</div>}
    </section>
  </main>
}

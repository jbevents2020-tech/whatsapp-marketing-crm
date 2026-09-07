'use client'

import { LayoutDashboard, Import, Megaphone, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/import', label: 'Import', icon: Import },
  { href: '/recipients', label: 'Recipients', icon: Users },
  { href: '/campaign', label: 'Campaign', icon: Megaphone },
]

export default function AppNav(){
  const pathname = usePathname()
  if(pathname==='/' || pathname.startsWith('/login') || pathname.startsWith('/connect')) return null
  return <nav className="app-nav" aria-label="CRM navigation">
    {items.map(item=>{
      const Icon=item.icon
      const active=pathname===item.href || (item.href==='/campaign' && pathname.startsWith('/campaign'))
      return <button key={item.href} className={active?'app-nav-item active':'app-nav-item'} onClick={()=>location.href=item.href}>
        <Icon size={18}/><span>{item.label}</span>
      </button>
    })}
  </nav>
}

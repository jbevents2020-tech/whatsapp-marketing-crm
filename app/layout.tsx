import './globals.css'
import './nav.css'
import AppNav from '../components/AppNav'

export const metadata = {
  title: 'JB WhatsApp Group Manager',
  description: 'Mobile-first WhatsApp group campaign manager',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppNav/>{children}</body>
    </html>
  )
}

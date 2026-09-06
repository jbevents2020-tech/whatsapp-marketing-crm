import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest){
  const { pathname } = request.nextUrl
  if(pathname.startsWith('/connect') || pathname.startsWith('/_next') || pathname === '/favicon.ico'){
    return NextResponse.next()
  }

  const connected = request.cookies.get('jb-wa-connected')?.value === '1'
  if(!connected){
    const url = request.nextUrl.clone()
    url.pathname = '/connect'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api).*)'],
}

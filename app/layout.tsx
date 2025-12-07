import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AuthWrapper } from "@/components/auth/AuthWrapper"

export const metadata: Metadata = {
  title: "CampusConnect | Portal del Docente",
  description: "Portal del Docente - CampusConnect",
  generator: "v0.app",
  icons: {
    icon: "/images/campus-connect-icon.png",
    shortcut: "/images/campus-connect-icon.png",
    apple: "/images/campus-connect-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AuthWrapper>
            <ScrollToTop />
            {children}
          </AuthWrapper>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { MainLayout } from "@/components/layout/main-layout"
import { Suspense } from "react"
import { ScrollToTop } from "@/components/scroll-to-top"

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
        <ScrollToTop />
        <Suspense fallback={<div>Loading...</div>}>
          <MainLayout>{children}</MainLayout>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

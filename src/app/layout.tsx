import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

const klaxon = localFont({
  src: "./fonts/Klaxon-Crunchy.otf",
  variable: "--font-klaxon",
})

export const metadata: Metadata = {
  title: "AI Website Replicator & Generator",
  description: "Clone any website or generate a new one with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${klaxon.variable}`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}

export function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
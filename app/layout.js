import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LuxyChat from '@/components/chat/LuxyChat'
import ClientProviders from '@/components/providers/ClientProviders'

export const metadata = {
  title: 'IVALUX IMPERIAL | Luxury Beauty & AI Consultation',
  description: 'Experience the future of luxury beauty with AI-powered consultations at IVALUX IMPERIAL',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-luxury-black text-luxury-ivory antialiased min-h-screen flex flex-col">
        <ClientProviders>
          <Header />
          <main className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
          <LuxyChat />
        </ClientProviders>
      </body>
    </html>
  )
}

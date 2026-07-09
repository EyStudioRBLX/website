import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Announcements from '@/components/Announcements'
import Games from '@/components/Games'
import Services from '@/components/Services'
import Team from '@/components/Team'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <Hero />
      <Announcements />
      <Games />
      <Services />
      <Team />
      <Contact />
      <Footer />
    </main>
  )
}

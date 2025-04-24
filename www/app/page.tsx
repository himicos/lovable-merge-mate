import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import Testimonials from "@/components/testimonials"
import Pricing from "@/components/pricing"
import CustomCursor from "@/components/custom-cursor"
import { Footerdemo } from "@/components/ui/footer-demo"
import CloudBackground from "@/components/cloud-background"

export default function Home() {
  return (
    <CloudBackground className="min-h-screen bg-gradient-to-b from-[#8de0ad] to-[#a7ebc3]">
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footerdemo />
    </CloudBackground>
  )
}

import Navbar from "@/components/navbar"
import CustomCursor from "@/components/custom-cursor"
import AboutHero from "@/components/about-hero"
import AboutValues from "@/components/about-values"
import AboutMission from "@/components/about-mission"
import { Footerdemo } from "@/components/ui/footer-demo"
import CloudBackground from "@/components/cloud-background"

export default function AboutPage() {
  return (
    <CloudBackground className="min-h-screen bg-gradient-to-b from-[#8de0ad] to-[#a7ebc3]">
      <CustomCursor />
      <Navbar />
      <main>
        <AboutHero />
        <AboutMission />
        <AboutValues />
      </main>
      <Footerdemo />
    </CloudBackground>
  )
}

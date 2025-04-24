import Navbar from "@/components/navbar"
import CustomCursor from "@/components/custom-cursor"
import TeamHero from "@/components/team-hero"
import TeamMembers from "@/components/team-members"
import { Footerdemo } from "@/components/ui/footer-demo"
import CloudBackground from "@/components/cloud-background"

export default function TeamPage() {
  return (
    <CloudBackground className="min-h-screen bg-gradient-to-b from-[#8de0ad] to-[#a7ebc3]">
      <CustomCursor />
      <Navbar />
      <main>
        <TeamHero />
        <TeamMembers />
      </main>
      <Footerdemo />
    </CloudBackground>
  )
}

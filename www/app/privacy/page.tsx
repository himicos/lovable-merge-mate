import Navbar from "@/components/navbar"
import CustomCursor from "@/components/custom-cursor"
import PrivacyContent from "@/components/privacy-content"
import { Footerdemo } from "@/components/ui/footer-demo"
import CloudBackground from "@/components/cloud-background"

export default function PrivacyPage() {
  return (
    <CloudBackground className="min-h-screen bg-gradient-to-b from-[#8de0ad] to-[#a7ebc3]">
      <CustomCursor />
      <Navbar />
      <main>
        <PrivacyContent />
      </main>
      <Footerdemo />
    </CloudBackground>
  )
}

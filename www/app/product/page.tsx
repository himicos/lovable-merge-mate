import Navbar from "@/components/navbar"
import CustomCursor from "@/components/custom-cursor"
import ProductHero from "@/components/product-hero"
import ProductFeatures from "@/components/product-features"
import ProductDemo from "@/components/product-demo"
import ProductSecurity from "@/components/product-security"
import { Footerdemo } from "@/components/ui/footer-demo"
import CloudBackground from "@/components/cloud-background"

export default function ProductPage() {
  return (
    <CloudBackground className="min-h-screen bg-gradient-to-b from-[#8de0ad] to-[#a7ebc3]">
      <CustomCursor />
      <Navbar />
      <main>
        <ProductHero />
        <ProductFeatures />
        <ProductDemo />
        <ProductSecurity />
      </main>
      <Footerdemo />
    </CloudBackground>
  )
}

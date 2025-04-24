"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Balloons, BalloonsRef } from "@/components/ui/balloons"

export default function Hero(): React.ReactElement {
  const balloonsRef = React.useRef<BalloonsRef>(null)

  const handleGetStarted = () => {
    if (balloonsRef.current) {
      balloonsRef.current.launchAnimation()
    }
  }

  return (
    <section className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#e8f5ea] via-[#d4fcdc] to-[#c8e6c9]">
      {/* Logo */}
      <div className="absolute top-8 left-8 w-48 h-16 z-10">
        <Image
          src="/images/verbylogo.png"
          alt="Verby Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#81c784_0%,_transparent_70%)] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#66bb6a_0%,_transparent_70%)] pointer-events-none opacity-20" />
      
      {/* Background clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left cloud */}
        <div className="absolute top-20 left-[10%] w-64 h-64 opacity-20 animate-float">
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
          />
        </div>
        {/* Top right cloud */}
        <div className="absolute top-40 right-[20%] w-48 h-48 opacity-30 animate-float" style={{ animationDelay: "2s" }}>
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
          />
        </div>
        {/* Bottom left cloud */}
        <div className="absolute bottom-32 left-[15%] w-56 h-56 opacity-25 animate-float" style={{ animationDelay: "1.5s" }}>
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
          />
        </div>
        {/* Bottom right cloud */}
        <div className="absolute bottom-48 right-[25%] w-40 h-40 opacity-20 animate-float" style={{ animationDelay: "2.5s" }}>
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
          />
        </div>
        {/* Middle cloud */}
        <div className="absolute top-1/2 left-[30%] w-52 h-52 opacity-15 animate-float" style={{ animationDelay: "3s" }}>
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <Balloons 
        ref={balloonsRef}
        type="text"
        text="🎈✨"
        fontSize={60}
        color="#66bb6a"
      />

      <div className="container mx-auto px-4 md:px-6 relative min-h-screen flex items-center">
        <div className="grid gap-12 lg:grid-cols-2 items-center py-16">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                <span className="text-verby-dark">Your calm inbox</span>
                <br />
                <span className="text-verby-primary">companion</span>
              </h1>
              <p className="text-xl text-verby-dark/80 max-w-[600px] leading-relaxed">
                Organizing email and chat so you don't have to. Like lying in the clouds while your inbox takes care of itself.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div>
                <Button 
                  className="text-lg px-8 py-6 rounded-xl bg-[#43a047] text-white hover:bg-white/90 hover:text-[#43a047] neu-shadow hover:neu-shadow-inset transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { name: "Gmail", logo: "/images/gmail.png" },
                    { name: "Slack", logo: "/images/slacklogo.png" },
                    { name: "Teams", logo: "/images/teamslogo.png" }
                  ].map((platform, i) => (
                    <div
                      key={platform.name}
                      className="w-10 h-10 rounded-full bg-white/90 neu-shadow relative overflow-hidden"
                      style={{ zIndex: 3 - i }}
                    >
                      <Image
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-verby-dark/70">Works with your tools</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[800px] max-w-4xl mx-auto">
            <div className="relative w-full h-full animate-float-character">
              <Image
                src="/images/cloudguy.png"
                alt="Verby character relaxing on a cloud"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

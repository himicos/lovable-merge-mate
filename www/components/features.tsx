"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { MessageSquare, Zap, Clock } from "lucide-react"

export default function Features() {
  const features = [
    {
      title: "Smart Summaries",
      description: "Get AI-powered summaries of your emails and chats in seconds.",
      icon: MessageSquare,
    },
    {
      title: "Prioritized Inbox",
      description: "Focus on what matters with intelligent message sorting.",
      icon: Zap,
    },
    {
      title: "Voice Playback",
      description: "Listen to your messages while you're on the go.",
      icon: Clock,
    },
  ]

  const platforms = [
    { name: "Gmail", logo: "/images/gmail.png" },
    { name: "Slack", logo: "/images/slacklogo.png" },
    { name: "Teams", logo: "/images/teamslogo.png" },
  ]

  return (
    <section className="w-full py-24 relative overflow-hidden bg-gradient-to-br from-[#b9eec3] via-[#a5e3b7] to-[#98d8aa]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#81c784_0%,_transparent_70%)] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#66bb6a_0%,_transparent_70%)] pointer-events-none opacity-20" />

      {/* Floating icons */}
      <div className="floating-icon" style={{ top: "25%", right: "25%" }}>
        <div className="w-24 h-24 relative">
          <Image
            src="/images/pencil.png"
            alt="Pencil icon"
            fill
            className="animate-float object-contain opacity-75"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "5%", left: "5%" }}>
        <div className="w-20 h-20 relative">
          <Image
            src="/images/emailbox.png"
            alt="Email icon"
            fill
            className="animate-float object-contain opacity-60"
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "15%", right: "8%" }}>
        <div className="w-16 h-16 relative">
          <Image
            src="/images/heart.png"
            alt="Heart icon"
            fill
            className="animate-float-reverse object-contain opacity-50"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "10%", left: "12%" }}>
        <div className="w-14 h-14 relative">
          <Image
            src="/images/star.png"
            alt="Star icon"
            fill
            className="animate-rotate object-contain opacity-40"
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "30%", left: "85%" }}>
        <div className="w-12 h-12 relative">
          <Image
            src="/images/star.png"
            alt="Star icon"
            fill
            className="animate-rotate-reverse object-contain opacity-45"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "20%", right: "5%" }}>
        <div className="w-18 h-18 relative">
          <Image
            src="/images/emailbox.png"
            alt="Email icon"
            fill
            className="animate-float-slow object-contain opacity-55"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl"
          >
            <h2>Features that simplify your communication</h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-verby-dark/70 max-w-[700px] mx-auto"
          >
            <p>Experience the power of AI-driven communication tools</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-4 text-verby-primary">
                <feature.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-verby-dark/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold text-verby-dark"
          >
            <h3>Works with your favorite platforms</h3>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-12"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
                ease: "easeOut"
              }}
              className="relative w-24 h-24"
            >
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                fill
                className="object-contain hover:scale-110 transition-transform duration-300"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

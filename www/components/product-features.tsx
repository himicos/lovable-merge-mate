"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import { MessageSquare, Zap, VolumeX } from "lucide-react"

export default function ProductFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-verby-primary" />,
      title: "AI-Powered Summaries",
      description:
        "Using Claude by Anthropic, Verby analyzes your emails and messages to extract the most important information, saving you time and mental energy.",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: <Zap className="h-10 w-10 text-verby-primary" />,
      title: "Smart Prioritization",
      description:
        "Our algorithms learn from your behavior to identify which messages need your immediate attention and which can wait, helping you focus on what matters most.",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: <VolumeX className="h-10 w-10 text-verby-primary" />,
      title: "Natural Voice Playback",
      description:
        "Listen to your message summaries on the go with ElevenLabs' natural-sounding voice technology, perfect for catching up during your commute.",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div ref={ref} className="space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`grid gap-8 items-center ${
                index % 2 === 0 ? "lg:grid-cols-[1fr_1.2fr]" : "lg:grid-cols-[1.2fr_1fr]"
              }`}
            >
              <div className={index % 2 === 1 ? "order-2 lg:order-1" : ""}>
                <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                  <Image src={feature.image || "/placeholder.svg"} alt={feature.title} fill className="object-cover" />
                </div>
              </div>
              <div className={index % 2 === 1 ? "order-1 lg:order-2" : ""}>
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-verby-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-verby-dark mb-4">{feature.title}</h3>
                <p className="text-verby-dark/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { Heart, Shield, Zap } from "lucide-react"

export default function AboutValues() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const values = [
    {
      icon: <Heart className="h-10 w-10 text-verby-primary" />,
      title: "Calm Technology",
      description:
        "We believe technology should reduce stress, not add to it. Every feature we build aims to bring more calm to your digital life.",
    },
    {
      icon: <Shield className="h-10 w-10 text-verby-primary" />,
      title: "Privacy First",
      description:
        "Your data is yours. We're committed to the highest standards of privacy and security in everything we do.",
    },
    {
      icon: <Zap className="h-10 w-10 text-verby-primary" />,
      title: "Thoughtful Efficiency",
      description: "We help you do more with less — less time, less stress, and less digital clutter.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-verby-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl">Our Values</h2>
          <p className="mt-4 text-lg text-verby-dark/70 max-w-[700px] mx-auto">
            These principles guide everything we do at Verby.
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="mb-4 p-3 rounded-full bg-verby-primary/10 inline-block">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-verby-dark">{value.title}</h3>
              <p className="text-verby-dark/70">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

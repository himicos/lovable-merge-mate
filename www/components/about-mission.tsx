"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"

export default function AboutMission() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl mb-6">Our Story</h2>
            <div className="space-y-4 text-verby-dark/80">
              <p>
                Verby was born out of frustration with the overwhelming nature of modern communication. Our founders, a
                team of productivity enthusiasts, were tired of spending hours each day sorting through emails,
                messages, and notifications.
              </p>
              <p>
                We asked ourselves: What if AI could help us cut through the noise? What if technology could give us
                back our time and attention, instead of constantly demanding it?
              </p>
              <p>
                That's how Verby came to be — a calm, thoughtful assistant that helps you focus on meaningful
                communication while filtering out the rest.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-verby-primary/10 rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-verby-primary flex items-center justify-center">
                <span className="text-white text-4xl font-bold">V</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

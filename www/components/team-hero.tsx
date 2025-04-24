"use client"

import { motion } from "framer-motion"

export default function TeamHero() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-verby-dark md:text-5xl">Meet Our Team</h1>
          <p className="mt-6 text-lg text-verby-dark/80">
            We're a small but mighty team passionate about creating calm technology that helps people focus on what
            truly matters.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

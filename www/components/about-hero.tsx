"use client"

import { motion } from "framer-motion"

export default function AboutHero() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-verby-dark md:text-5xl">
            About <span className="text-verby-primary">Verby</span>
          </h1>
          <p className="mt-6 text-lg text-verby-dark/80">
            We're on a mission to bring calm back to your digital life. In a world of constant notifications and endless
            chatter, Verby helps you focus on what truly matters.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

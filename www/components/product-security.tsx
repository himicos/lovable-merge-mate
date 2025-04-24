"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { Shield, Lock, Eye } from "lucide-react"

export default function ProductSecurity() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const securityFeatures = [
    {
      icon: <Shield className="h-10 w-10 text-verby-primary" />,
      title: "End-to-End Encryption",
      description: "Your messages are encrypted in transit and at rest, ensuring that only you can access your data.",
    },
    {
      icon: <Lock className="h-10 w-10 text-verby-primary" />,
      title: "Data Minimization",
      description:
        "We only store the data necessary to provide our service, and we delete it as soon as it's no longer needed.",
    },
    {
      icon: <Eye className="h-10 w-10 text-verby-primary" />,
      title: "Transparent Privacy",
      description:
        "We're clear about what data we collect and how we use it. You're in control of your information at all times.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl">Privacy & Security</h2>
          <p className="mt-4 text-lg text-verby-dark/70 max-w-[700px] mx-auto">
            Your data is precious. Here's how we keep it safe.
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-3">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-verby-background p-6 rounded-xl shadow-sm"
            >
              <div className="mb-4 p-3 rounded-full bg-verby-primary/10 inline-block">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-verby-dark">{feature.title}</h3>
              <p className="text-verby-dark/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

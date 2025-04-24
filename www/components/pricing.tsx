"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "5 email summaries per day",
        "Basic prioritization",
        "Text summaries only"
      ]
    },
    {
      name: "Pro",
      price: "$10",
      description: "Best for professionals",
      features: [
        "Unlimited summaries",
        "Advanced prioritization",
        "Voice playback",
        "Priority support"
      ]
    },
    {
      name: "Team",
      price: "$25",
      description: "Perfect for small teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Admin dashboard",
        "Custom integrations"
      ]
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 relative overflow-hidden bg-gradient-to-br from-[#b9eec3] via-[#a5e3b7] to-[#98d8aa]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#81c784_0%,_transparent_70%)] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#66bb6a_0%,_transparent_70%)] pointer-events-none opacity-20" />

      {/* Currency signs */}
      <div className="floating-icon" style={{ top: "3%", left: "2%" }}>
        <div className="w-16 h-16 relative">
          <Image
            src="/images/dollarsign.png"
            alt="Dollar sign"
            fill
            className="animate-float object-contain opacity-65"
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "15%", right: "3%" }}>
        <div className="w-20 h-20 relative">
          <Image
            src="/images/eurosign.png"
            alt="Euro sign"
            fill
            className="animate-float-reverse object-contain opacity-55"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "5%", left: "5%" }}>
        <div className="w-24 h-24 relative">
          <Image
            src="/images/eurosign.png"
            alt="Euro sign"
            fill
            className="animate-float-slow object-contain opacity-45"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "20%", right: "2%" }}>
        <div className="w-14 h-14 relative">
          <Image
            src="/images/dollarsign.png"
            alt="Dollar sign"
            fill
            className="animate-float object-contain opacity-60"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "35%", left: "92%" }}>
        <div className="w-12 h-12 relative">
          <Image
            src="/images/dollarsign.png"
            alt="Dollar sign"
            fill
            className="animate-float-reverse object-contain opacity-50"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "15%", right: "88%" }}>
        <div className="w-18 h-18 relative">
          <Image
            src="/images/eurosign.png"
            alt="Euro sign"
            fill
            className="animate-float-slow object-contain opacity-40"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-verby-dark/70 max-w-[700px] mx-auto">
            Choose the plan that works best for you and your team.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: index === 1 ? 1.05 : 1.02 }}
              className={`${index === 1 ? 'highlight-border' : ''}`}
            >
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm relative hover:shadow-md transition-all duration-300 neu-shadow">
                <h3 className="text-xl font-bold text-verby-dark">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-verby-dark">{plan.price}</span>
                </div>
                <p className="text-verby-dark/70 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-verby-primary mr-2" />
                      <span className="text-verby-dark">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-[#66bb6a] hover:bg-[#4caf50] text-white shadow-lg hover:shadow-xl hover:scale-105 ${
                    index === 1 && 'bg-[#4caf50] hover:bg-[#43a047] shadow-xl'
                  }`}
                >
                  {index === 1 ? 'Get Pro Now' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import * as React from "react"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Verby has completely transformed how I handle my inbox. I save at least an hour every day.",
      author: "Sarah J.",
      role: "Product Manager"
    },
    {
      quote: "The voice playback feature is a game-changer for catching up on messages during my commute.",
      author: "Michael R.",
      role: "Sales Director"
    },
    {
      quote: "Smart summaries help me stay on top of important conversations without getting overwhelmed.",
      author: "Lisa T.",
      role: "Team Lead"
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 relative overflow-hidden bg-gradient-to-br from-[#b9eec3] via-[#a5e3b7] to-[#98d8aa]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#81c784_0%,_transparent_70%)] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#66bb6a_0%,_transparent_70%)] pointer-events-none opacity-20" />

      {/* Floating hearts */}
      <div className="floating-icon" style={{ top: "5%", left: "3%" }}>
        <div className="w-14 h-14 relative">
          <Image
            src="/images/heart.png"
            alt="Heart"
            fill
            className="animate-float object-contain opacity-70"
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "20%", right: "5%" }}>
        <div className="w-20 h-20 relative">
          <Image
            src="/images/heart.png"
            alt="Heart"
            fill
            className="animate-float-reverse object-contain opacity-60"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "8%", left: "8%" }}>
        <div className="w-16 h-16 relative">
          <Image
            src="/images/heart.png"
            alt="Heart"
            fill
            className="animate-float-slow object-contain opacity-50"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ bottom: "25%", right: "3%" }}>
        <div className="w-12 h-12 relative">
          <Image
            src="/images/heart.png"
            alt="Heart"
            fill
            className="animate-float object-contain opacity-65"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>
      <div className="floating-icon" style={{ top: "40%", left: "90%" }}>
        <div className="w-10 h-10 relative">
          <Image
            src="/images/heart.png"
            alt="Heart"
            fill
            className="animate-float-reverse object-contain opacity-55"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <div
            className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl"
          >
            What our users say 
          </div>
          <div
            className="mt-4 text-lg text-verby-dark/70 max-w-[700px] mx-auto"
          >
            Join thousands of professionals who have reclaimed their time with Verby.
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white/90 p-6 rounded-xl shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow duration-300"
            >
              <Quote className="h-8 w-8 text-verby-primary mb-4" />
              <p className="text-verby-dark mb-4">{testimonial.quote}</p>
              <div>
                <p className="font-semibold text-verby-dark">{testimonial.author}</p>
                <p className="text-sm text-verby-dark/70">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import type React from "react"
import { motion } from "framer-motion"

interface CloudBackgroundProps {
  children: React.ReactNode
  className?: string
}

export default function CloudBackground({ children, className = "" }: CloudBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[10%] w-32 h-24 bg-[#a7ebc3] rounded-full opacity-30 blur-xl" />
        <div className="absolute top-[20%] right-[15%] w-48 h-32 bg-[#a7ebc3] rounded-full opacity-40 blur-xl" />
        <div className="absolute top-[40%] left-[25%] w-40 h-28 bg-[#a7ebc3] rounded-full opacity-30 blur-xl" />
        <div className="absolute bottom-[20%] right-[20%] w-36 h-24 bg-[#a7ebc3] rounded-full opacity-30 blur-xl" />
        <div className="absolute bottom-[30%] left-[15%] w-28 h-20 bg-[#a7ebc3] rounded-full opacity-30 blur-xl" />

        {/* Stars */}
        <motion.div
          className="absolute top-[15%] left-[40%] w-6 h-6 text-[#d0f5d9]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-[25%] right-[30%] w-5 h-5 text-[#d0f5d9]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </motion.div>

        {/* Chat bubble */}
        <div className="absolute bottom-[35%] left-[20%] w-24 h-24">
          <svg viewBox="0 0 100 100" fill="#4eca7c">
            <path
              d="M50,10C27.9,10,10,25.9,10,45.5c0,10.1,4.6,19.3,12.1,26c-0.1,9.6-1.8,17.6-5.3,23.4c-0.5,0.9-0.5,1.9,0.1,2.7
              c0.5,0.7,1.3,1.1,2.1,1.1c0.2,0,0.4,0,0.6-0.1c12.7-3.1,21.3-8.2,25.4-11.1c1.6,0.2,3.2,0.3,4.9,0.3c22.1,0,40-15.9,40-35.5
              S72.1,10,50,10z M35,50c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S37.8,50,35,50z M50,50c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5
              S52.8,50,50,50z M65,50c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S67.8,50,65,50z"
            />
          </svg>
        </div>

        {/* Smiling cloud */}
        <div className="absolute bottom-[40%] right-[15%] w-32 h-24">
          <svg viewBox="0 0 100 70" fill="#a7ebc3" stroke="#4eca7c" strokeWidth="1">
            <path
              d="M85,40.5c0-5.2-4.3-9.5-9.5-9.5c-0.9,0-1.8,0.1-2.6,0.4C71.4,23.1,63.8,17,55,17c-9.4,0-17.3,6.9-18.7,16
              c-0.8-0.2-1.6-0.3-2.4-0.3c-5.9,0-10.7,4.8-10.7,10.7c0,5.9,4.8,10.7,10.7,10.7h42.6C81.9,54,85,50.9,85,47.3
              C85,45.2,85,42.6,85,40.5z"
            />
            <path
              d="M40,40c0,1.1-0.9,2-2,2s-2-0.9-2-2"
              fill="none"
              stroke="#4eca7c"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M65,40c0,1.1-0.9,2-2,2s-2-0.9-2-2"
              fill="none"
              stroke="#4eca7c"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M55,45c-3.3,0-6,2.7-6,6" fill="none" stroke="#4eca7c" strokeWidth="2" strokeLinecap="round" />
            <path d="M55,45c3.3,0,6,2.7,6,6" fill="none" stroke="#4eca7c" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

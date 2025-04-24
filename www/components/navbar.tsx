"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Home, Github, Linkedin } from "lucide-react"
import { FloatingNav } from "./ui/floating-navbar"

export default function Navbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-verby-dark" />,
    },
    {
      name: "Github",
      link: "https://github.com",
      icon: <Github className="h-4 w-4 text-verby-dark" />,
    },
    {
      name: "LinkedIn",
      link: "https://linkedin.com",
      icon: <Linkedin className="h-4 w-4 text-verby-dark" />,
    },
  ]

  return (
    <>
      <FloatingNav navItems={navItems} />
      <nav className="w-full py-4 px-6 md:px-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center text-verby-dark hover:text-verby-primary transition-colors">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <span className="text-lg font-medium">
                <span className="text-verby-dark">Home</span>
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 rounded-md text-verby-dark hover:text-verby-primary transition-colors group"
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <span className="mr-1">Github</span>
                <ExternalLink size={14} className="inline-block" />
              </motion.div>
            </Link>

            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 rounded-md text-verby-dark hover:text-verby-primary transition-colors group"
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <span className="mr-1">LinkedIn</span>
                <ExternalLink size={14} className="inline-block" />
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

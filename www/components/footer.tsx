"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Footer() {
  const productLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
  ]

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
  ]

  return (
    <footer className="w-full py-12 relative overflow-hidden bg-gradient-to-br from-[#2d3436] via-[#2d3436] to-[#1e2628]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#81c784_0%,_transparent_70%)] pointer-events-none opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#66bb6a_0%,_transparent_70%)] pointer-events-none opacity-10" />
      
      {/* Background clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-[10%] w-48 h-48 opacity-5 animate-float">
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="absolute bottom-32 left-[15%] w-56 h-56 opacity-5 animate-float">
          <Image
            src="/images/cloud.png"
            alt="Background cloud"
            fill
            className="object-contain"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/images/cloud.png"
                alt="Verby Logo"
                width={40}
                height={40}
                className="opacity-90"
              />
              <h1 className="text-2xl font-semibold text-white">verby</h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-white/70 max-w-xs"
            >
              <p>Your calm inbox companion. Free yourself from the noise of endless chats and emails.</p>
            </motion.div>
          </div>

          {/* Product Links */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-semibold mb-4 text-white"
            >
              <h2>Product</h2>
            </motion.div>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <li>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-verby-primary transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                </motion.div>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-semibold mb-4 text-white"
            >
              <h2>Company</h2>
            </motion.div>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <li>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-verby-primary transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                </motion.div>
              ))}
            </ul>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/10 text-center text-white/50"
        >
          <p>&copy; {new Date().getFullYear()} Verby. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}

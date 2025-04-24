"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import { Github, Linkedin, Twitter } from "lucide-react"

export default function TeamMembers() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Former product lead at Google. Passionate about creating technology that enhances human potential.",
      funFact: "Can solve a Rubik's cube in under a minute.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Maya Rodriguez",
      role: "CTO",
      bio: "AI researcher with a PhD from MIT. Believes in building ethical, human-centered AI systems.",
      funFact: "Competitive chess player with a FIDE rating of 2100.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Jordan Taylor",
      role: "Head of Design",
      bio: "Previously led design at Headspace. Focused on creating calm, intuitive user experiences.",
      funFact: "Certified yoga instructor who teaches weekly classes.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Sam Patel",
      role: "Lead Engineer",
      bio: "Full-stack developer with expertise in React and Node.js. Loves building performant, accessible web applications.",
      funFact: "Amateur baker who makes sourdough bread every weekend.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div ref={ref} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-verby-background rounded-xl overflow-hidden"
            >
              <div className="relative h-64 overflow-hidden">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-verby-dark">{member.name}</h3>
                <p className="text-verby-primary font-medium mb-2">{member.role}</p>
                <p className="text-verby-dark/70 text-sm mb-4">{member.bio}</p>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  whileHover={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <p className="text-verby-dark/70 text-sm italic mb-4">
                    <span className="font-medium">Fun fact:</span> {member.funFact}
                  </p>
                </motion.div>

                <div className="flex space-x-3 mt-4">
                  <motion.a
                    href={member.social.twitter}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-verby-dark/70 hover:text-verby-primary"
                  >
                    <Twitter size={18} />
                  </motion.a>
                  <motion.a
                    href={member.social.linkedin}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-verby-dark/70 hover:text-verby-primary"
                  >
                    <Linkedin size={18} />
                  </motion.a>
                  <motion.a
                    href={member.social.github}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-verby-dark/70 hover:text-verby-primary"
                  >
                    <Github size={18} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

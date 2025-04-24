"use client"

import { motion } from "framer-motion"

export default function PrivacyContent() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-verby-dark md:text-5xl mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-verby-dark/80">
            <p className="text-lg">
              At Verby, we take your privacy seriously. This policy explains how we collect, use, and protect your
              personal information.
            </p>

            <h2 className="text-2xl font-semibold text-verby-dark mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, subscribe to
              our service, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Communication preferences</li>
              <li>Content of emails and messages you choose to process through our service</li>
            </ul>

            <h2 className="text-2xl font-semibold text-verby-dark mt-8 mb-4">How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
            </ul>

            <h2 className="text-2xl font-semibold text-verby-dark mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized or unlawful processing, accidental loss, destruction, or damage.
            </p>

            <h2 className="text-2xl font-semibold text-verby-dark mt-8 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your information</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
            </ul>

            <h2 className="text-2xl font-semibold text-verby-dark mt-8 mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@verby.com.</p>

            <p className="mt-8 text-sm">Last updated: April 10, 2025</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

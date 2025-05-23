"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play } from "lucide-react"

export default function ProductDemo() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSummarize = () => {
    if (!inputText.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSummary(
        "This is a summary of the input text. In a real implementation, this would be generated by Claude AI based on the user's input.",
      )
      setIsLoading(false)
    }, 1500)
  }

  return (
    <section className="w-full py-12 md:py-24 bg-verby-background">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-verby-dark md:text-4xl">Try It Yourself</h2>
            <p className="mt-4 text-lg text-verby-dark/70">
              Paste any text below to see how Verby's summarization works.
            </p>
          </div>

          <div className="space-y-6">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste an email, message, or any text you'd like to summarize..."
              className="min-h-[200px] bg-white"
            />

            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  onClick={handleSummarize}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-verby-primary hover:bg-verby-primary/90 text-white px-8"
                >
                  {isLoading ? "Summarizing..." : "Summarize"}
                </Button>
              </motion.div>
            </div>

            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 p-6 bg-white rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-semibold text-verby-dark mb-4">Summary</h3>
                <p className="text-verby-dark/80">{summary}</p>

                <div className="mt-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-verby-primary/20 text-verby-dark hover:bg-verby-primary/10"
                    >
                      <Play className="h-4 w-4" />
                      Listen
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

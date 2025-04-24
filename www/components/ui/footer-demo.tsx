"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [isChatOpen, setIsChatOpen] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-white/80 backdrop-blur-sm text-verby-dark transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
            <p className="mb-6 text-verby-dark/70">Join our newsletter for the latest updates and exclusive offers.</p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-full border-verby-primary/20 bg-white/80 pr-12 placeholder:text-verby-dark/50"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 absolute right-1 top-1 h-8 w-8 rounded-full bg-[#66bb6a] hover:bg-[#4caf50] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-verby-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <a href="/" className="block transition-colors hover:text-verby-primary">
                Home
              </a>
              <a href="/about" className="block transition-colors hover:text-verby-primary">
                About Us
              </a>
              <a href="/team" className="block transition-colors hover:text-verby-primary">
                Team
              </a>
              <a href="/product" className="block transition-colors hover:text-verby-primary">
                Product
              </a>
              <a href="/privacy" className="block transition-colors hover:text-verby-primary">
                Privacy
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>123 Innovation Street</p>
              <p>Tech City, TC 12345</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: hello@verby.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border-verby-primary/20 p-2"
                    >
                      <Facebook className="h-4 w-4 text-verby-primary" />
                      <span className="sr-only">Facebook</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border-verby-primary/20 p-2"
                    >
                      <Twitter className="h-4 w-4 text-verby-primary" />
                      <span className="sr-only">Twitter</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border-verby-primary/20 p-2"
                    >
                      <Instagram className="h-4 w-4 text-verby-primary" />
                      <span className="sr-only">Instagram</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border-verby-primary/20 p-2"
                    >
                      <Linkedin className="h-4 w-4 text-verby-primary" />
                      <span className="sr-only">LinkedIn</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-verby-dark" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-verby-primary"
              />
              <Moon className="h-4 w-4 text-verby-dark" />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-verby-primary/10 pt-8 text-center md:flex-row">
          <p className="text-sm text-verby-dark/70">2025 Verby. Made with ❤️ Love</p>
          <nav className="flex gap-4 text-sm">
            <a href="/privacy" className="transition-colors hover:text-verby-primary">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-verby-primary">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }

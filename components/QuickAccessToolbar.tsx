"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const QuickAccessToolbar: React.FC = () => {
  const pathname = usePathname()

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative group ${
          isActive ? "text-primary" : "text-foreground hover:text-primary"
        }`}
      >
        {children}
        <span
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ease-out ${
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
    )
  }

  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4 md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/features">Features</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/about">About</NavLink>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="h-8 w-8 mr-2">
            <img src="/logo-light.png" alt="Logo Light" className="block dark:hidden" />
            <img src="/logo-dark.png" alt="Logo Dark" className="hidden dark:block" />
          </div>
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            EduSynapse
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#steve">Steve</NavLink>
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuickAccessToolbar


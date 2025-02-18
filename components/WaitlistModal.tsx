"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log("Submitted email:", email)
    setIsSubmitted(true)
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Join the Waitlist</ModalTitle>
          <ModalDescription>
            Be the first to know when EduSynapse launches. Enter your email below to join our waitlist.
          </ModalDescription>
        </ModalHeader>
        {isSubmitted ? (
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-green-600">Thank you for joining our waitlist!</p>
            <p className="text-sm text-muted-foreground mt-2">We'll keep you updated on our progress.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" className="w-full">Join Waitlist</Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}

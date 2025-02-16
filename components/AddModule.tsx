"use client"

import type React from "react"
import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PlusCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AddModuleProps {
  isOpen: boolean
  onClose: () => void
  onAddModule: (topic: string) => void
  isGenerating: boolean
}

const AddModule: React.FC<AddModuleProps> = ({ isOpen, onClose, onAddModule, isGenerating }) => {
  const [topic, setTopic] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isGenerating) {
      toast({
        title: "Error",
        description: "Please enter a module topic",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    onAddModule(topic)
    setTopic("")
    toast({
      title: "Success",
      description: "Module generation started",
      duration: 3000,
    })
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-foreground">
            <PlusCircle className="h-5 w-5 text-primary" />
            Generate New Module
          </ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Module Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter module topic"
              className="w-full"
              disabled={isGenerating}
            />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Module"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddModule


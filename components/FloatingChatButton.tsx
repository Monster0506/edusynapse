import type React from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
      onClick={onClick}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
}

export default FloatingChatButton


import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import ChatPopup from "./ChatPopup"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Chat {
  id: string
  title: string
}

interface ChatManagerProps {
  isOpen: boolean
}

const ChatManager: React.FC<ChatManagerProps> = ({ isOpen }) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadChats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch chats')
      }
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  // Load chats when component mounts and when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

  const createNewChat = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Chat ${chats.length + 1}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create chat')
      }
      
      const newChat = await response.json()
      // Update local state and reload chats to ensure consistency
      setChats(prevChats => [...prevChats, newChat])
      setActiveChat(newChat.id)
      // Reload chats to ensure we have the latest data
      loadChats()
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to delete chat')
      }

      setChats(chats.filter((chat) => chat.id !== chatId))
      if (activeChat === chatId) {
        setActiveChat(null)
      }
      // Reload chats to ensure we have the latest data
      loadChats()
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-20 right-4 w-64 max-h-[calc(100vh-120px)] overflow-y-auto z-50">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Chats</CardTitle>
        <Button variant="outline" size="icon" onClick={createNewChat} disabled={isLoading}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id} className="flex justify-between items-center">
              <Button
                variant={activeChat === chat.id ? "default" : "ghost"}
                className="flex-1 justify-start"
                onClick={() => setActiveChat(chat.id)}
              >
                {chat.title}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteChat(chat.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
      {activeChat && (
        <ChatPopup
          isOpen={true}
          onClose={() => setActiveChat(null)}
          chatId={activeChat}
          onDelete={deleteChat}
        />
      )}
    </Card>
  )
}

export default ChatManager

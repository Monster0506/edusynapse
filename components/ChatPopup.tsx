"use client"

import type React, { useCallback, useEffect } from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, Minus, Plus, Paperclip, Mic, VolumeX, Volume2, Calculator, FileDown, Brain, ChevronLeft, MessageSquare, ArrowLeft, ArrowRight } from "lucide-react"
import MessagesHandler from "@/lib/ai/handlers/messagesHandler"
import { fileStorage } from "@/lib/ai/handlers/fileUploadHandler"
import type { Message } from "@/lib/ai/interfaces/interfaces"
import { useMutation } from "react-query"
import { userModels } from "@/lib/ai/constants/models"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTTS } from "@/hooks/useTTS"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface Chat {
  id: string
  title: string
}

const TypingAnimation: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return

    setDisplayedText("")
    setIsComplete(false)

    const duration = 2000
    const totalChars = text.length
    const intervalTime = duration / totalChars
    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex++
      setDisplayedText(text.slice(0, currentIndex))

      if (currentIndex >= totalChars) {
        clearInterval(interval)
        setIsComplete(true)
        onComplete()
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [text, onComplete])

  if (isComplete) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
  }

  return (
    <div className="relative">
      <span className="after:content-['▋'] after:animate-blink after:ml-[1px]">{displayedText}</span>
    </div>
  )
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("natural")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [chats, setChats] = useState<Array<{ id: string; title: string }>>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null)
  const { speak, stop, isPlaying } = useTTS()
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null)

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [lastAssistantMessageId, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedChatId) {
      loadMessages()
    }
  }, [selectedChatId])

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
      // Select the last chat if there are any chats and no chat is currently selected
      if (data.length > 0 && !selectedChatId) {
        setSelectedChatId(data[data.length - 1].id)
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const loadMessages = async () => {
    if (!selectedChatId) {
      setMessages([])
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error('[ChatPopup] No authentication token found')
        return
      }

      const response = await fetch(`/api/chats?chatId=${selectedChatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 404) {
        const createResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedChatId,
            title: 'New Chat',
          }),
        })

        if (!createResponse.ok) {
          console.error('[ChatPopup] Failed to create chat:', createResponse.statusText)
          return
        }

        setMessages([])
        return
      }

      if (!response.ok) {
        console.error('[ChatPopup] Failed to fetch messages:', response.statusText)
        return
      }

      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('[ChatPopup] Error loading messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error('[ChatPopup] No authentication token found')
        return
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'New Chat',
        }),
      })

      if (!response.ok) {
        console.error('[ChatPopup] Failed to create chat:', response.statusText)
        return
      }

      const newChat = await response.json()
      setChats(prev => [...prev, newChat])
      setSelectedChatId(newChat.id)
      setMessages([])
    } catch (error) {
      console.error('[ChatPopup] Error creating chat:', error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error('[ChatPopup] No authentication token found')
        return
      }

      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('[ChatPopup] Failed to delete chat:', response.statusText)
        return
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('[ChatPopup] Error deleting chat:', error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedChatId) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error('[ChatPopup] No authentication token found')
        return
      }

      // Save user message first
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: selectedChatId,
          content,
          role: 'user'
        }),
      })

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json().catch(() => ({}))
        console.error('[ChatPopup] Failed to save user message:', {
          status: messageResponse.status,
          statusText: messageResponse.statusText,
          error: errorData
        })
        throw new Error('Failed to save message')
      }

      const savedUserMessage = await messageResponse.json()
      setMessages(prev => [...prev, savedUserMessage])

      // Track the user message ID to avoid duplication
      const userMessageId = savedUserMessage.id

      // Get AI response from chat API
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: content,
          modelType: selectedModel
        }),
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}))
        console.error('[ChatPopup] Failed to get AI response:', {
          status: aiResponse.status,
          statusText: aiResponse.statusText,
          error: errorData
        })
        throw new Error('Failed to get AI response')
      }

      const aiData = await aiResponse.json()

      // Save messages from the AI response
      if (aiData.messages && aiData.messages.length > 0) {
        const savedMessageIds = new Set([userMessageId]) // Track saved message IDs
        const newMessages: Message[] = []

        for (const msg of aiData.messages) {
          // For tool messages, ensure we have both content and display
          const messageData = {
            chatId: selectedChatId,
            content: msg.content,
            role: msg.role || 'assistant',
            display: msg.role === 'tool' ? (msg.display || msg.content) : undefined
          }

          const messageResponse = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData),
          })

          if (!messageResponse.ok) {
            console.error('[ChatPopup] Failed to save message:', {
              status: messageResponse.status,
              statusText: messageResponse.statusText,
              message: msg
            })
            continue
          }

          const savedMessage = await messageResponse.json()

          if (!savedMessageIds.has(savedMessage.id)) {
            savedMessageIds.add(savedMessage.id)
            newMessages.push(savedMessage)
            if (savedMessage.role === 'assistant') {
              setLastAssistantMessageId(savedMessage.id)
            }
          }
        }
        setMessages(prev => [...prev, ...newMessages])
      } else if (aiData.message) {
        // If no messages array, save just the final message
        const messageResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            chatId: selectedChatId,
            content: aiData.message,
            role: 'assistant'
          }),
        })

        if (!messageResponse.ok) {
          const errorData = await messageResponse.json().catch(() => ({}))
          console.error('[ChatPopup] Failed to save message:', {
            status: messageResponse.status,
            statusText: messageResponse.statusText,
            error: errorData
          })
          throw new Error('Failed to save message')
        }

        const savedMessage = await messageResponse.json()
        setMessages(prev => [...prev, savedMessage])
      }
    } catch (error) {
      console.error('[ChatPopup] Error in message flow:', {
        error,
        selectedChatId,
        stack: error.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    
    if (content) {
      setIsLoading(true)
      try {
        await sendMessage(content)
        setInput("") // Clear the input after sending
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedChatId) return

    const validExtensions = [".txt", ".md", ".json", ".csv", ".log", ".js", ".ts", ".tsx", ".jsx", ".html", ".css"]
    const isValidType =
      file.type.startsWith("text/") || validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, only text files are supported.",
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    try {
      const content = await file.text()
      const fileMessage = `I've uploaded a text file named "${file.name}". Here's its contents:\n\n${content}`
      await sendMessage(fileMessage)
    } catch (error) {
      console.error("Error in file upload process:", error)
      const errorMessage = {
        role: "assistant",
        content: "Sorry, there was an error uploading your file. Please try again.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAnimationComplete = (index: number) => {
    // Removed this function as it was not being used
  }

  const handleSpeak = (messageIndex: number, text: string) => {
    if (speakingMessageId === messageIndex) {
      stop()
      setSpeakingMessageId(null)
    } else {
      if (speakingMessageId !== null) {
        stop()
      }
      setSpeakingMessageId(messageIndex)
      speak(text)
    }
  }

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user'

    return (
      <div className={`max-w-[80%] ${isUser ? "ml-auto" : "mr-auto"}`}>
        <div
          className={`relative rounded-2xl px-4 py-2 shadow-sm ${
            isUser
              ? 'bg-green-600 text-white rounded-br-sm'
              : 'bg-card text-card-foreground rounded-bl-sm'
          }`}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? "text-white" : "dark:prose-invert"}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return (
                    <code
                      className={`${inline
                        ? isUser
                          ? "bg-black/10 text-zinc-900"
                          : "bg-muted"
                        : "block bg-black/10 text-zinc-900 p-2 rounded"
                      } font-mono text-sm rounded px-1`}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre({ node, children, ...props }) {
                  return (
                    <pre className={`${isUser ? "bg-black/10 text-zinc-900" : "bg-muted"} rounded-lg p-3 overflow-x-auto my-2`} {...props}>
                      {children}
                    </pre>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  const handleVoiceInput = () => {
    // Removed this function as it was not being used
  }

  if (!isOpen) return null

  return (
    <Card
      className={`fixed z-50 transition-all duration-300 ${isFullscreen
          ? 'top-0 left-0 right-0 bottom-0 w-full h-full rounded-none'
          : 'bottom-4 right-4 w-[400px] h-[600px]'
        }`}
    >
      <CardHeader className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardTitle className="text-lg font-semibold">AI Tutor Chat</CardTitle>
        <div className="flex space-x-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(userModels).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {key.replace("_", " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Upload text file"
            className="h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="h-8 w-8"
          >
            {isFullscreen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <div className="flex h-[calc(100%-4rem)] overflow-hidden relative">
        {/* Chat List Sidebar */}
        <div 
          className={`relative transition-all duration-300 ease-in-out border-r bg-muted/30 flex flex-col ${
            isSidebarCollapsed ? 'w-0 px-0 overflow-hidden' : 'w-[200px]'
          }`}
        >
          <div className="flex items-center justify-between p-2 border-b min-w-[200px]">
            <Button
              onClick={createNewChat}
              variant="outline"
              className="flex-1"
            >
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 min-w-[200px]">
            {chats.map(chat => (
              <Button
                key={chat.id}
                variant={selectedChatId === chat.id ? "secondary" : "ghost"}
                className="w-full justify-between text-sm"
                onClick={() => setSelectedChatId(chat.id)}
                title={chat.title}
              >
                <span className="truncate">{chat.title}</span>
                {selectedChatId === chat.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="h-6 w-6 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`h-8 w-8 absolute z-10 top-[72px] transition-all duration-300 bg-background shadow-sm hover:bg-accent ${
            isSidebarCollapsed ? 'left-0 rounded-r-md' : 'left-[184px] rounded-r-md'
          }`}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </Button>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-card text-card-foreground rounded-bl-sm'
                  }`}
                >
                  <div className="prose dark:prose-invert max-w-none">
                    {message.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-background/50"
                        onClick={() => handleSpeak(index, message.content)}
                        title={speakingMessageId === index ? "Stop speaking" : "Speak message"}
                      >
                        {speakingMessageId === index ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    {message.role === 'user' && message.attachments?.map((attachment, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span>{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] mr-12 shadow-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.log,.js,.ts,.tsx,.jsx,.html,.css"
                onChange={handleFileUpload}
                className="hidden"
              />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-background resize-none overflow-hidden min-h-[40px] max-h-[200px] px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !selectedChatId}
                size="icon"
                className="h-11 w-11"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ChatPopup

"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, Minus, Plus, Paperclip, VolumeX, Volume2, ArrowLeft, ArrowRight, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTTS } from "@/hooks/useTTS"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Message } from "@/lib/ai/interfaces/interfaces"
import { userModels } from "@/lib/ai/constants/models"

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
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
  }, [scrollToBottom])

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
        console.error("No authentication token found")
        return
      }

      const response = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch chats")
      }
      const data = await response.json()
      setChats(data)
      // Select the last chat if there are any chats and no chat is currently selected
      if (data.length > 0 && !selectedChatId) {
        setSelectedChatId(data[data.length - 1].id)
      }
    } catch (error) {
      console.error("Error loading chats:", error)
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
        console.error("[ChatPopup] No authentication token found")
        return
      }

      const response = await fetch(`/api/chats?chatId=${selectedChatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        const createResponse = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedChatId,
            title: "New Chat",
          }),
        })

        if (!createResponse.ok) {
          console.error("[ChatPopup] Failed to create chat:", createResponse.statusText)
          return
        }

        setMessages([])
        return
      }

      if (!response.ok) {
        console.error("[ChatPopup] Failed to fetch messages:", response.statusText)
        return
      }

      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("[ChatPopup] Error loading messages:", error)
    }
  }

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("[ChatPopup] No authentication token found")
        return
      }

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Chat",
        }),
      })

      if (!response.ok) {
        console.error("[ChatPopup] Failed to create chat:", response.statusText)
        return
      }

      const newChat = await response.json()
      setChats((prev) => [...prev, newChat])
      setSelectedChatId(newChat.id)
      setMessages([])
    } catch (error) {
      console.error("[ChatPopup] Error creating chat:", error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("[ChatPopup] No authentication token found")
        return
      }

      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error("[ChatPopup] Failed to delete chat:", response.statusText)
        return
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
        setMessages([])
      }
    } catch (error) {
      console.error("[ChatPopup] Error deleting chat:", error)
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
        console.error("[ChatPopup] No authentication token found")
        return
      }

      // Save user message first
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChatId,
          content,
          role: "user",
        }),
      })

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json().catch(() => ({}))
        console.error("[ChatPopup] Failed to save user message:", {
          status: messageResponse.status,
          statusText: messageResponse.statusText,
          error: errorData,
        })
        throw new Error("Failed to save message")
      }

      const savedUserMessage = await messageResponse.json()
      setMessages((prev) => [...prev, savedUserMessage])

      // Track the user message ID to avoid duplication
      const userMessageId = savedUserMessage.id

      // Get AI response from chat API
      const aiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          modelType: selectedModel,
        }),
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}))
        console.error("[ChatPopup] Failed to get AI response:", {
          status: aiResponse.status,
          statusText: aiResponse.statusText,
          error: errorData,
        })
        throw new Error("Failed to get AI response")
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
            role: msg.role || "assistant",
            display: msg.role === "tool" ? msg.display || msg.content : undefined,
          }

          const messageResponse = await fetch("/api/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData),
          })

          if (!messageResponse.ok) {
            console.error("[ChatPopup] Failed to save message:", {
              status: messageResponse.status,
              statusText: messageResponse.statusText,
              message: msg,
            })
            continue
          }

          const savedMessage = await messageResponse.json()

          if (!savedMessageIds.has(savedMessage.id)) {
            savedMessageIds.add(savedMessage.id)
            newMessages.push(savedMessage)
            if (savedMessage.role === "assistant") {
              setLastAssistantMessageId(savedMessage.id)
            }
          }
        }
        setMessages((prev) => [...prev, ...newMessages])
      } else if (aiData.message) {
        // If no messages array, save just the final message
        const messageResponse = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: selectedChatId,
            content: aiData.message,
            role: "assistant",
          }),
        })

        if (!messageResponse.ok) {
          const errorData = await messageResponse.json().catch(() => ({}))
          console.error("[ChatPopup] Failed to save message:", {
            status: messageResponse.status,
            statusText: messageResponse.statusText,
            error: errorData,
          })
          throw new Error("Failed to save message")
        }

        const savedMessage = await messageResponse.json()
        setMessages((prev) => [...prev, savedMessage])
      }
    } catch (error) {
      console.error("[ChatPopup] Error in message flow:", {
        error,
        selectedChatId,
        stack: error.stack,
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
        console.error("Error sending message:", error)
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
      setMessages((prev) => [...prev, errorMessage])
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
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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
    const isUser = message.role === "user"
    const isTool = message.role === "tool"

    // Skip rendering tool messages - they'll be combined with assistant messages
    if (isTool) return null

    // If this is an assistant message, look ahead for any tool messages that follow
    let toolContent = ""
    if (message.role === "assistant" && index < messages.length - 1) {
      const nextMessage = messages[index + 1]
      if (nextMessage.role === "tool") {
        toolContent = nextMessage.content
      }
    }

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
        <div
          className={`relative max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${
            isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm"
          }`}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? "text-primary-foreground" : "dark:prose-invert"}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return (
                    <code
                      className={`${
                        inline
                          ? isUser
                            ? "bg-primary-foreground/10 text-primary-foreground"
                            : "bg-muted"
                          : `block ${isUser ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted"} p-2 rounded`
                      } font-mono text-sm rounded px-1`}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre({ node, children, ...props }) {
                  return (
                    <pre
                      className={`${isUser ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted"} rounded-lg p-3 overflow-x-auto my-2`}
                      {...props}
                    >
                      {children}
                    </pre>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Render tool content if it exists */}
            {toolContent && (
              <div className="mt-2 p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{toolContent}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
            {message.role === "assistant" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-background/50"
                onClick={() => handleSpeak(index, message.content)}
                title={speakingMessageId === index ? "Stop speaking" : "Speak message"}
              >
                {speakingMessageId === index ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            )}
            {message.role === "user" &&
              message.attachments?.map((attachment, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <Paperclip className="h-3 w-3" />
                  <span>{attachment.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <Card
      className={`fixed z-50 transition-all duration-300 ${
        isFullscreen
          ? "top-0 left-0 right-0 bottom-0 w-full h-full rounded-none"
          : "bottom-4 right-4 w-[400px] h-[500px]"
      }`}
    >
      <CardHeader className="flex justify-between items-center p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardTitle className="text-base font-semibold">AI Tutor Chat</CardTitle>
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
      <div className="flex h-[calc(100%-2.75rem)] overflow-hidden relative">
        {/* Chat List Sidebar */}
        <div
          className={`relative transition-all duration-300 ease-in-out border-r bg-muted/30 flex flex-col ${
            isSidebarCollapsed ? "w-0 px-0 overflow-hidden" : "w-[200px]"
          }`}
        >
          <div className="flex items-center justify-between p-2 border-b min-w-[200px]">
            <Button onClick={createNewChat} variant="outline" className="flex-1">
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[200px]">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={selectedChatId === chat.id ? "secondary" : "ghost"}
                className="w-full justify-between text-sm group"
                onClick={() => setSelectedChatId(chat.id)}
                title={chat.title}
              >
                <span className="truncate">{chat.title}</span>
                {selectedChatId === chat.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                    className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Button>
            ))}
          </div>
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute right-0 top-[50px] h-6 w-6 -mr-3 bg-background hover:bg-accent rounded-l-none border-l"
              title="Collapse sidebar"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isSidebarCollapsed && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-2 top-[50px] h-6 w-6 transition-all duration-300 hover:translate-x-0.5 z-10"
            title="Expand sidebar"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-muted/50 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent pb-[60px]" ref={chatContainerRef}>

            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] mr-12 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 w-full">


          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv,.log,.js,.ts,.tsx,.jsx,.html,.css"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="relative flex-1">
          <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Type a message..."
  className="w-full resize-none overflow-y-auto h-auto min-h-[44px] max-h-[120px] px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring pr-12 text-sm"
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }}
  style={{
    height: `${Math.min(120, Math.max(44, input.split("\n").length * 20))}px`,
  }}
/>


            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || !selectedChatId}
              className="absolute right-2 bottom-2 h-7 w-7 hover:bg-accent"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ChatPopup


"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const ContentManagement = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const fetchTopics = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch("/api/admin/topics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.json()
  }

  const { data: topics, isLoading: isLoadingTopics, error: topicsError } = useQuery("adminTopics", fetchTopics)

  const fetchContentItems = async ({ queryKey }: any) => {
    const [_key, topicId] = queryKey
    if (!topicId) return []
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/admin/topics/${topicId}/content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.json()
  }

  const {
    data: contentItems,
    isLoading: isLoadingContent,
    error: contentError,
  } = useQuery(["adminContent", selectedTopic], fetchContentItems, {
    enabled: !!selectedTopic,
  })

  const updateContentMutation = useMutation(
    async ({ contentId, updates }: { contentId: string; updates: any }) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error("Failed to update content")
      }
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["adminContent", selectedTopic])
      },
    },
  )

  const handleUpdateContent = (contentId: string, updates: any) => {
    updateContentMutation.mutate({ contentId, updates })
  }

  if (isLoadingTopics) return <div>Loading topics...</div>
  if (topicsError) return <div>Error loading topics: {(topicsError as Error).message}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={(value) => setSelectedTopic(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {topics &&
                topics.map((topic: any) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTopic && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Content Items</h3>
            {isLoadingContent && <div>Loading content...</div>}
            {contentError && <div>Error loading content: {(contentError as Error).message}</div>}
            {contentItems && contentItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateContent(item.id, { published: !item.published })}
                        >
                          {item.published ? "Unpublish" : "Publish"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No content items found for this topic.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ContentManagement


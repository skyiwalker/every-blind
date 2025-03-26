"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getAllTags } from "@/lib/api"

export function TagFilter() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTag = searchParams.get("tag")

  useEffect(() => {
    async function fetchTags() {
      setLoading(true)
      try {
        const tagNames = await getAllTags()
        setTags(tagNames)
      } catch (error) {
        console.error("Error fetching tags:", error)
        setTags([])
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const handleTagClick = (tag: string | null) => {
    if (tag === null) {
      router.push("/")
    } else {
      router.push(`/?tag=${tag}`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="animate-pulse">
          로딩 중...
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge
        variant={currentTag === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => handleTagClick(null)}
      >
        전체
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={currentTag === tag ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlusCircle, X, ArrowLeft, Vote, MessageSquare } from "lucide-react"
import { generateAnonymousName } from "@/lib/name-generator"
import PollCreator from "@/components/poll-creator"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { createPost, createPollOptions, createOrUpdateTags } from "@/lib/api"

export default function CreatePost() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState("regular")
  const [pollOptions, setPollOptions] = useState<{ text: string }[]>([{ text: "" }, { text: "" }])
  const [isSubjective, setIsSubjective] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const anonymousName = generateAnonymousName()

      // 게시물 생성
      const postData = {
        title: title.trim(),
        content: content.trim(),
        anonymous_name: anonymousName,
        tags: tags.length > 0 ? tags : [],
        has_poll: postType === "poll",
      }

      console.log("Creating post with data:", postData)

      const post = await createPost(postData)

      console.log("Post created successfully:", post)

      // 투표 게시물인 경우 투표 옵션 생성
      if (postType === "poll") {
        const validPollOptions = pollOptions
          .filter((option) => option.text.trim())
          .map((option) => ({
            post_id: post.id,
            option_text: option.text.trim(),
            is_subjective: isSubjective,
          }))

        if (validPollOptions.length < 2) {
          throw new Error("투표 옵션은 최소 2개 이상 입력해야 합니다.")
        }

        console.log("Creating poll options:", validPollOptions)

        await createPollOptions(validPollOptions)
      }

      // 태그 생성 또는 업데이트
      if (tags.length > 0) {
        await createOrUpdateTags(tags)
      }

      toast({
        title: "게시물 작성 완료",
        description: "게시물이 성공적으로 작성되었습니다.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)

      let errorMessage = "게시물 작성 중 오류가 발생했습니다."
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "오류 발생",
        description: errorMessage,
        variant: "destructive",
        action: <ToastAction altText="다시 시도">다시 시도</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">새 글 작성하기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">태그 (최대 5개)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="태그 입력 후 Enter"
                    disabled={tags.length >= 5}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={tags.length >= 5 || !tagInput.trim()}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Tabs defaultValue="regular" onValueChange={setPostType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="regular" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    일반 게시글
                  </TabsTrigger>
                  <TabsTrigger value="poll" className="flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    투표 게시글
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="regular">
                  <div className="mt-4">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="poll">
                  <div className="mt-4">
                    <Label htmlFor="poll-content">내용</Label>
                    <Textarea
                      id="poll-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="투표에 대한 설명을 입력하세요"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label>투표 옵션</Label>
                      <div className="flex items-center space-x-2">
                        <Switch id="subjective-mode" checked={isSubjective} onCheckedChange={setIsSubjective} />
                        <Label htmlFor="subjective-mode">주관식 투표</Label>
                      </div>
                    </div>

                    <PollCreator options={pollOptions} setOptions={setPollOptions} isSubjective={isSubjective} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <CardFooter className="flex justify-end px-0 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "게시 중..." : "게시하기"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


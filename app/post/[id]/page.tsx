"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, ThumbsUp, Vote } from "lucide-react"
import { getRandomAnimalEmoji } from "@/lib/emoji-utils"
import { formatDistanceToNow } from "@/lib/date-utils"
import { generateAnonymousName } from "@/lib/name-generator"
import PollDisplay from "@/components/poll-display"
import CommentList from "@/components/comment-list"
import { toast } from "@/components/ui/use-toast"
import { getPostById, getPollOptionsByPostId, createComment, likePost } from "@/lib/api"

type Post = {
  id: string
  title: string
  content: string
  created_at: string
  anonymous_name: string
  tags: string[]
  likes: number
  comments_count: number
  has_poll: boolean
}

type PollOption = {
  id: string
  post_id: string
  option_text: string
  votes: number
  is_subjective: boolean
}

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [pollOptions, setPollOptions] = useState<PollOption[]>([])
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      try {
        // 게시물 데이터 가져오기
        const postData = await getPostById(params.id)
        setPost(postData)

        // 좋아요 상태 확인
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
        setIsLiked(likedPosts.includes(params.id))

        // 투표 옵션 가져오기 (투표 게시물인 경우)
        if (postData.has_poll) {
          const pollData = await getPollOptionsByPostId(params.id)
          setPollOptions(pollData)

          // 투표 상태 확인
          const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]")
          setHasVoted(votedPolls.includes(params.id))
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          title: "오류 발생",
          description: "게시물을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router])

  const handleLike = async () => {
    if (!post || isLiked) return

    try {
      // 좋아요 증가
      const updatedPost = await likePost(post.id)

      // 상태 업데이트
      setPost({ ...post, likes: updatedPost.likes })
      setIsLiked(true)

      // 로컬 스토리지에 좋아요 상태 저장
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
      localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, post.id]))

      toast({
        title: "좋아요",
        description: "게시물에 좋아요를 표시했습니다.",
      })
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "오류 발생",
        description: "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !comment.trim()) return

    setIsSubmitting(true)

    try {
      const anonymousName = generateAnonymousName()

      // 댓글 생성
      const newComment = await createComment({
        post_id: post.id,
        content: comment.trim(),
        anonymous_name: anonymousName,
      })

      // 상태 업데이트
      setPost({ ...post, comments_count: post.comments_count + 1 })
      setComment("")

      // 댓글 목록 컴포넌트에 새 댓글 추가 이벤트 발생
      const commentAddedEvent = new CustomEvent("comment-added", {
        detail: newComment,
      })
      window.dispatchEvent(commentAddedEvent)

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "오류 발생",
        description: "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">로딩 중...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">게시글을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        돌아가기
      </Button>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{post.title}</CardTitle>
            {post.has_poll && (
              <Badge variant="secondary">
                <Vote className="h-3 w-3 mr-1" />
                투표
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <span>{getRandomAnimalEmoji(post.anonymous_name)}</span>
            <span>{post.anonymous_name}</span>
            <span className="text-xs">• {formatDistanceToNow(post.created_at)}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="whitespace-pre-line">{post.content}</p>

          {post.has_poll && pollOptions.length > 0 && (
            <div className="mt-6">
              <PollDisplay
                postId={post.id}
                options={pollOptions}
                hasVoted={hasVoted}
                setHasVoted={setHasVoted}
                setPollOptions={setPollOptions}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLike}
              disabled={isLiked}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? "text-primary" : ""}`} />
              <span>{post.likes}</span>
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">댓글 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment}>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="min-h-[100px]"
              required
            />
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "게시 중..." : "댓글 작성"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CommentList postId={post.id} />
    </div>
  )
}


import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import PostList from "@/components/post-list"
import { TagFilter } from "@/components/tag-filter"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-primary">에브리뒷담</h1>
          <Sparkles className="h-6 w-6 text-yellow-400" />
        </div>
        <p className="text-muted-foreground">에브리심 회사 내부 익명 게시판</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <Suspense
          fallback={
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-8 w-20 bg-muted animate-pulse rounded-full"></div>
            </div>
          }
        >
          <TagFilter />
        </Suspense>
        <Link href="/create">
          <Button className="w-full md:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />새 글 작성하기
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={<div className="flex justify-center py-8">로딩 중...</div>}>
          <PostList />
        </Suspense>
      </div>
    </div>
  )
}


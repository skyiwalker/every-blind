"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { votePollOption, addSubjectiveAnswer } from "@/lib/api"

type PollOption = {
  id: string
  post_id: string
  option_text: string
  votes: number
  is_subjective: boolean
}

type PollDisplayProps = {
  postId: string
  options: PollOption[]
  hasVoted: boolean
  setHasVoted: (value: boolean) => void
  setPollOptions: React.Dispatch<React.SetStateAction<PollOption[]>>
}

export default function PollDisplay({ postId, options, hasVoted, setHasVoted, setPollOptions }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSubjective = options.length > 0 && options[0].is_subjective
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

  const handleVote = async () => {
    if (hasVoted || isSubmitting || (!selectedOption && !isSubjective)) return

    setIsSubmitting(true)

    try {
      if (isSubjective && selectedOption) {
        // 주관식 투표인 경우
        if (!subjectiveAnswer.trim()) {
          toast({
            title: "입력 오류",
            description: "주관식 답변을 입력해주세요.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // 주관식 답변 추가 및 투표 수 증가
        await addSubjectiveAnswer({
          post_id: postId,
          option_id: selectedOption,
          answer: subjectiveAnswer.trim(),
        })

        // 로컬 상태 업데이트
        const updatedOptions = options.map((opt) =>
          opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt,
        )
        setPollOptions(updatedOptions)
      } else if (selectedOption) {
        // 객관식 투표인 경우
        // 투표 수 증가
        await votePollOption(selectedOption)

        // 로컬 상태 업데이트
        const updatedOptions = options.map((opt) =>
          opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt,
        )
        setPollOptions(updatedOptions)
      }

      // 투표 완료 상태 저장
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]")
      localStorage.setItem("votedPolls", JSON.stringify([...votedPolls, postId]))

      setHasVoted(true)

      toast({
        title: "투표 완료",
        description: "투표가 성공적으로 등록되었습니다.",
      })
    } catch (error) {
      console.error("Error submitting vote:", error)
      toast({
        title: "오류 발생",
        description: "투표 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">투표</h3>

      <div className="space-y-3">
        {options.map((option) => {
          const votePercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

          return (
            <div key={option.id} className="space-y-2">
              {hasVoted ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.option_text}</span>
                    <span className="text-muted-foreground">
                      {option.votes}표 ({votePercentage}%)
                    </span>
                  </div>
                  <Progress value={votePercentage} className="h-2" />
                </div>
              ) : (
                <div
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedOption === option.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 ${
                        selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    />
                    <span>{option.option_text}</span>
                  </div>

                  {isSubjective && selectedOption === option.id && (
                    <Input
                      className="mt-2"
                      placeholder="답변을 입력하세요"
                      value={subjectiveAnswer}
                      onChange={(e) => setSubjectiveAnswer(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!hasVoted && (
        <Button
          className="w-full mt-4"
          onClick={handleVote}
          disabled={isSubmitting || !selectedOption || (isSubjective && selectedOption && !subjectiveAnswer.trim())}
        >
          {isSubmitting ? "투표 중..." : "투표하기"}
        </Button>
      )}

      {hasVoted && (
        <div className="text-center text-sm text-muted-foreground mt-4">총 {totalVotes}명이 투표했습니다</div>
      )}
    </div>
  )
}


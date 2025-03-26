"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"

type PollOption = {
  text: string
}

type PollCreatorProps = {
  options: PollOption[]
  setOptions: React.Dispatch<React.SetStateAction<PollOption[]>>
  isSubjective: boolean
}

export default function PollCreator({ options, setOptions, isSubjective }: PollCreatorProps) {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].text = value
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { text: "" }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={option.text}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={isSubjective ? "주관식 답변 제목" : `옵션 ${index + 1}`}
            required
          />
          {options.length > 2 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      ))}

      {options.length < 10 && (
        <Button type="button" variant="outline" className="w-full mt-2" onClick={addOption}>
          <PlusCircle className="mr-2 h-4 w-4" />
          옵션 추가하기
        </Button>
      )}
    </div>
  )
}


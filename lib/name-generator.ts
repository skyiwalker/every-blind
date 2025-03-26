// 귀여운 익명 이름 생성기
const adjectives = [
  "귀여운",
  "깜찍한",
  "행복한",
  "즐거운",
  "신나는",
  "활발한",
  "용감한",
  "멋진",
  "재미있는",
  "친절한",
  "상냥한",
  "따뜻한",
  "부드러운",
  "달콤한",
  "향기로운",
  "반짝이는",
  "빛나는",
  "아름다운",
  "예쁜",
  "멋진",
]

const nouns = [
  "호박씨",
  "씨앗",
  "도토리",
  "밤",
  "콩",
  "팥",
  "쌀알",
  "보리",
  "옥수수",
  "해바라기씨",
  "참깨",
  "들깨",
  "땅콩",
  "아몬드",
  "호두",
  "밤톨",
  "은행",
  "잣",
  "대추",
  "감자",
]

// 랜덤 익명 이름 생성 함수
export function generateAnonymousName(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]

  return `${randomAdjective} ${randomNoun}`
}


// 귀여운 동물 이모지 목록
const animalEmojis = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦆",
  "🦉",
  "🦇",
  "🐺",
  "🐗",
  "🐴",
  "🦄",
  "🐝",
  "🐛",
  "🦋",
  "🐌",
  "🐞",
  "🐜",
  "🦟",
]

// 이름에 따라 일관된 이모지를 반환하는 함수
export function getRandomAnimalEmoji(name: string): string {
  // 이름에서 해시 값을 생성
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0 // 32비트 정수로 변환
  }

  // 해시 값을 이모지 배열의 인덱스로 변환
  const index = Math.abs(hash) % animalEmojis.length
  return animalEmojis[index]
}


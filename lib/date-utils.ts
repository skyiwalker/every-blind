// 날짜를 "n분 전", "n시간 전", "n일 전" 형식으로 변환하는 함수
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // 1분 미만
  if (seconds < 60) {
    return "방금 전"
  }

  // 1시간 미만
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}분 전`
  }

  // 1일 미만
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}시간 전`
  }

  // 1주일 미만
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}일 전`
  }

  // 1개월 미만
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}주 전`
  }

  // 1년 미만
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}개월 전`
  }

  // 1년 이상
  const years = Math.floor(months / 12)
  return `${years}년 전`
}


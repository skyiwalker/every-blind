import { createClient } from "@/lib/supabase-client"

// 게시물 관련 API 함수
export async function getPosts(tagFilter?: string | null) {
  const supabase = createClient()
  let query = supabase.from("posts").select("*")

  if (tagFilter) {
    query = query.contains("tags", [tagFilter])
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPostById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createPost(postData: {
  title: string
  content: string
  anonymous_name: string
  tags: string[]
  has_poll: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...postData,
      likes: 0,
      comments_count: 0,
    })
    .select()

  if (error) throw error
  return data[0]
}

export async function updatePost(
  id: string,
  updates: {
    title?: string
    content?: string
    tags?: string[]
    likes?: number
    comments_count?: number
  },
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deletePost(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("posts").delete().eq("id", id)

  if (error) throw error
  return true
}

// 댓글 관련 API 함수
export async function getCommentsByPostId(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createComment(commentData: {
  post_id: string
  content: string
  anonymous_name: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from("comments").insert(commentData).select()

  if (error) throw error

  // 댓글 수 증가
  await updatePost(commentData.post_id, {
    comments_count: (await getPostById(commentData.post_id)).comments_count + 1,
  })

  return data[0]
}

export async function deleteComment(id: string, postId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("comments").delete().eq("id", id)

  if (error) throw error

  // 댓글 수 감소
  const post = await getPostById(postId)
  if (post.comments_count > 0) {
    await updatePost(postId, {
      comments_count: post.comments_count - 1,
    })
  }

  return true
}

// 투표 관련 API 함수
export async function getPollOptionsByPostId(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("poll_options").select("*").eq("post_id", postId).order("id")

  if (error) throw error
  return data || []
}

export async function createPollOptions(
  options: {
    post_id: string
    option_text: string
    is_subjective: boolean
  }[],
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("poll_options")
    .insert(
      options.map((option) => ({
        ...option,
        votes: 0,
      })),
    )
    .select()

  if (error) throw error
  return data
}

export async function votePollOption(optionId: string) {
  const supabase = createClient()

  // 현재 투표 수 가져오기
  const { data: currentOption, error: fetchError } = await supabase
    .from("poll_options")
    .select("votes")
    .eq("id", optionId)
    .single()

  if (fetchError) throw fetchError

  // 투표 수 증가
  const { data, error } = await supabase
    .from("poll_options")
    .update({ votes: currentOption.votes + 1 })
    .eq("id", optionId)
    .select()

  if (error) throw error
  return data[0]
}

export async function addSubjectiveAnswer(answerData: {
  post_id: string
  option_id: string
  answer: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from("subjective_answers").insert(answerData).select()

  if (error) throw error

  // 투표 수 증가
  await votePollOption(answerData.option_id)

  return data[0]
}

export async function getSubjectiveAnswersByPostId(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("subjective_answers")
    .select("*, poll_options(option_text)")
    .eq("post_id", postId)

  if (error) throw error
  return data || []
}

// 태그 관련 API 함수
export async function getAllTags() {
  const supabase = createClient()
  const { data, error } = await supabase.from("tags").select("name")

  if (error) throw error
  return (data || []).map((tag) => tag.name)
}

export async function createOrUpdateTags(tagNames: string[]) {
  const supabase = createClient()

  const results = []
  for (const name of tagNames) {
    const { data, error } = await supabase.from("tags").upsert({ name }, { onConflict: "name" }).select()

    if (error) throw error
    if (data && data.length > 0) {
      results.push(data[0])
    }
  }

  return results
}

// 좋아요 관련 API 함수
export async function likePost(postId: string) {
  const supabase = createClient()

  // 현재 좋아요 수 가져오기
  const { data: currentPost, error: fetchError } = await supabase
    .from("posts")
    .select("likes")
    .eq("id", postId)
    .single()

  if (fetchError) throw fetchError

  // 좋아요 수 증가
  const { data, error } = await supabase
    .from("posts")
    .update({ likes: currentPost.likes + 1 })
    .eq("id", postId)
    .select()

  if (error) throw error
  return data[0]
}


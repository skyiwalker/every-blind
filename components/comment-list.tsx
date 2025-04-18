'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRandomAnimalEmoji } from '@/lib/emoji-utils';
import { formatDistanceToNow } from '@/lib/date-utils';
import { getCommentsByPostId } from '@/lib/api';
import { createClient } from '@/lib/supabase-client';

type Comment = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  anonymous_name: string;
};

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const data = await getCommentsByPostId(postId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();

    // 새 댓글 추가 이벤트 리스너
    const handleCommentAdded = (event: CustomEvent) => {
      const newComment = event.detail;
      setComments((prevComments) => [newComment, ...prevComments]);
    };

    window.addEventListener(
      'comment-added',
      handleCommentAdded as EventListener,
    );

    // 실시간 댓글 업데이트를 위한 구독 설정
    const supabase = createClient();
    const subscription = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // 이미 추가된 댓글인지 확인 (중복 방지)
          const newComment = payload.new as Comment;
          setComments((prev) => {
            if (!prev.some((comment) => comment.id === newComment.id)) {
              return [newComment, ...prev];
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener(
        'comment-added',
        handleCommentAdded as EventListener,
      );
      subscription.unsubscribe();
    };
  }, [postId]);

  if (loading) {
    return <div className="flex justify-center py-4">댓글 로딩 중...</div>;
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">댓글</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            아직 댓글이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">댓글 {comments.length}개</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-b pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-1 text-sm mb-1">
              <span>{getRandomAnimalEmoji(comment.anonymous_name)}</span>
              <span className="font-medium">{comment.anonymous_name}</span>
              <span className="text-xs text-muted-foreground">
                • {formatDistanceToNow(comment.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-line break-words">{comment.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

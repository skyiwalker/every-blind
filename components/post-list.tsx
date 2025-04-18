'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageCircle, ThumbsUp, Vote } from 'lucide-react';
import { getRandomAnimalEmoji } from '@/lib/emoji-utils';
import { formatDistanceToNow } from '@/lib/date-utils';
import { getPosts } from '@/lib/api';

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  anonymous_name: string;
  tags: string[];
  likes: number;
  comments_count: number;
  has_poll: boolean;
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const data = await getPosts(tagFilter);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [tagFilter]);

  if (loading) {
    return <div className="flex justify-center py-8">로딩 중...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">아직 게시글이 없어요!</p>
        <Link href="/create">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
          >
            첫 게시글 작성하기
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {posts.map((post) => (
        <Link href={`/post/${post.id}`} key={post.id}>
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{post.title}</CardTitle>
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
            </CardHeader>
            <CardContent className="pb-2">
              <p className="line-clamp-2 text-muted-foreground">
                {post.content}
              </p>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>{getRandomAnimalEmoji(post.anonymous_name)}</span>
                <span>{post.anonymous_name}</span>
                <span className="text-xs">
                  • {formatDistanceToNow(post.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

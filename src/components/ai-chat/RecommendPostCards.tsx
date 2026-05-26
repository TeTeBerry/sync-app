import AiAssistantPostCard from "../AiAssistantPostCard";
import type { RecommendedPostCard } from "../../types/aiChat";

export function RecommendPostCards({ posts }: { posts: RecommendedPostCard[] }) {
  if (!posts.length) return null;

  return (
    <div className="s-ai-assistant-chat__post-cards">
      {posts.map((post) => (
        <AiAssistantPostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}

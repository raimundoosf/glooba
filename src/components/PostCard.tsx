/**
 * Component for displaying individual posts with interactions.
 * @module PostCard
 */
"use client";

import {
  PostWithDetails,
  createComment,
  deletePost,
  toggleLike,
} from "@/actions/post.action";
import TimeAgo from "@/components/TimeAgo";
import { SignInButton, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";

/**
 * Props interface for the PostCard component
 * @interface PostCardProps
 */
interface PostCardProps {
  post: PostWithDetails;
  dbUserId: string | null;
  onActionComplete?: () => void | Promise<void>;
}

/**
 * Component that displays a post with:
 * - Author information (avatar, name, username)
 * - Post content and image (if any)
 * - Like functionality
 * - Comment functionality
 * - Delete functionality (for post author)
 * @param {PostCardProps} props - Component props
 * @returns {JSX.Element} The post card component
 */
export default function PostCard({
  post,
  dbUserId,
  onActionComplete,
}: PostCardProps) {
  const { user } = useUser();

  const [newComment, setNewComment] = useState("");
  const [isCommenting, startCommentTransition] = useTransition();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Handles post like/unlike with optimistic updates.
   */
  const handleLike = async () => {
    if (isLiking || !dbUserId) return;
    setIsLiking(true);
    const originalLiked = hasLiked;
    const originalCount = optimisticLikes;
    setHasLiked((prev) => !prev);
    setOptmisticLikes((prev) => prev + (originalLiked ? -1 : 1));
    try {
      await toggleLike(post.id);
    } catch (error) {
      toast.error("Failed to update like status.");
      setHasLiked(originalLiked);
      setOptmisticLikes(originalCount);
    } finally {
      setIsLiking(false);
    }
  };

  /**
   * Handles comment creation with optimistic updates.
   */
  const handleAddComment = async () => {
    if (!newComment.trim() || !dbUserId) return;
    startCommentTransition(async () => {
      try {
        const result = await createComment(post.id, newComment);
        if (result?.success) {
          toast.success("Comentario publicado exitosamente");
          setNewComment("");
          if (onActionComplete) await onActionComplete();
        } else {
          throw new Error(result.error || "Unknown error adding comment");
        }
      } catch (error) {
        toast.error(
          `Falló al agregar comentario: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  };

  /**
   * Handles post deletion with optimistic updates.
   */
  const handleDeletePost = async () => {
    startDeleteTransition(async () => {
      try {
        const result = await deletePost(post.id);
        if (result.success) {
          toast.success("Publicación eliminada exitosamente");
          if (onActionComplete) await onActionComplete();
        } else {
          throw new Error(result.error || "Unknown error deleting post");
        }
      } catch (error) {
        toast.error(
          `Falló al eliminar publicación: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10 flex-shrink-0">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    {post.author.isCompany && (
                      <svg
                        width="18px"
                        height="18px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M9.02975 3.3437C10.9834 2.88543 13.0166 2.88543 14.9703 3.3437C17.7916 4.00549 19.9945 6.20842 20.6563 9.02975C21.1146 10.9834 21.1146 13.0166 20.6563 14.9703C19.9945 17.7916 17.7916 19.9945 14.9703 20.6563C13.0166 21.1146 10.9834 21.1146 9.02975 20.6563C6.20842 19.9945 4.0055 17.7916 3.3437 14.9703C2.88543 13.0166 2.88543 10.9834 3.3437 9.02974C4.0055 6.20841 6.20842 4.00549 9.02975 3.3437ZM15.0524 10.4773C15.2689 10.2454 15.2563 9.88195 15.0244 9.6655C14.7925 9.44906 14.4291 9.46159 14.2126 9.6935L11.2678 12.8487L9.77358 11.3545C9.54927 11.1302 9.1856 11.1302 8.9613 11.3545C8.73699 11.5788 8.73699 11.9425 8.9613 12.1668L10.8759 14.0814C10.986 14.1915 11.1362 14.2522 11.2919 14.2495C11.4477 14.2468 11.5956 14.181 11.7019 14.0671L15.0524 10.4773Z"
                          fill="#1281ff"
                        />
                      </svg>
                    )}
                    <span>•</span>
                    <TimeAgo date={post.createdAt} />
                  </div>
                </div>
                {/* Delete Button (only if author) */}
                {dbUserId === post.authorId && (
                  <DeleteAlertDialog
                    onDelete={handleDeletePost}
                    isDeleting={isDeleting}
                  />
                )}
              </div>
            </div>
          </div>

          <p className="mt-2 text-sm text-foreground break-words">
            {post.content}
          </p>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Like & Comment Buttons */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-2"
                >
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => {
                const nextShowComments = !showComments;
                setShowComments(nextShowComments);
                // Scroll to input only when opening the comment section
                if (nextShowComments) {
                  // Use setTimeout to ensure the textarea is rendered before scrolling
                  setTimeout(() => {
                    commentInputRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    commentInputRef.current?.focus();
                  }, 100);
                }
              }}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t-2 border-primary/20">
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage
                        src={comment.author.image ?? "/avatar.png"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        {comment.author.isCompany && (
                          <svg
                            className="inline-flex items-center "
                            width="18px"
                            height="18px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M9.02975 3.3437C10.9834 2.88543 13.0166 2.88543 14.9703 3.3437C17.7916 4.00549 19.9945 6.20842 20.6563 9.02975C21.1146 10.9834 21.1146 13.0166 20.6563 14.9703C19.9945 17.7916 17.7916 19.9945 14.9703 20.6563C13.0166 21.1146 10.9834 21.1146 9.02975 20.6563C6.20842 19.9945 4.0055 17.7916 3.3437 14.9703C2.88543 13.0166 2.88543 10.9834 3.3437 9.02974C4.0055 6.20841 6.20842 4.00549 9.02975 3.3437ZM15.0524 10.4773C15.2689 10.2454 15.2563 9.88195 15.0244 9.6655C14.7925 9.44906 14.4291 9.46159 14.2126 9.6935L11.2678 12.8487L9.77358 11.3545C9.54927 11.1302 9.1856 11.1302 8.9613 11.3545C8.73699 11.5788 8.73699 11.9425 8.9613 12.1668L10.8759 14.0814C10.986 14.1915 11.1362 14.2522 11.2919 14.2495C11.4477 14.2468 11.5956 14.181 11.7019 14.0671L15.0524 10.4773Z"
                              fill="#1281ff "
                            />
                          </svg>
                        )}
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          Hace{" "}
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      ref={commentInputRef}
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Publicando..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comentar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border-2 border-primary/20 rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Inicia sesión para comentar
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

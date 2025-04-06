// src/components/CreatePost.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react"; // Added useTransition
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload"; // Assuming this component exists and works
import { useFeedContext } from "@/contexts/FeedContext"; // Import context hook

function CreatePost() {
  const { user } = useUser();
  const feedContext = useFeedContext(); // Get context
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Use useTransition for the posting state for better pending UI management
  const [isPosting, startPostingTransition] = useTransition();
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    startPostingTransition(async () => { // Wrap action call in transition
        try {
            const result = await createPost(content, imageUrl);
            if (result?.success) {
                // reset the form
                setContent("");
                setImageUrl("");
                setShowImageUpload(false);
                toast.success("Publicación creada con éxito");

                // *** Trigger feed refresh using context ***
                if (feedContext) {
                    await feedContext.refreshFeed(); // Await the refresh
                    console.log("Feed refresh triggered from CreatePost");
                } else {
                    console.warn("FeedContext not found, cannot refresh feed automatically.");
                    // Consider fallback: window.location.reload(); or router.refresh() if available
                }

            } else {
                // Handle specific error from action result
                throw new Error(result.error || "Unknown error creating post");
            }
        } catch (error) {
            console.error("Error al crear publicación:", error);
            toast.error(`Error al crear publicación: ${error instanceof Error ? error.message : String(error)}`);
        }
        // isPosting state is automatically handled by useTransition
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <Textarea
              placeholder="¿Que estas pensando?"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base flex-grow" // Added flex-grow
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>

          {(showImageUpload || imageUrl) && (
            <div className="border rounded-lg p-4">
              <ImageUpload
                endpoint="postImage" // Make sure this matches your uploadthing core.ts
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url); // url will be empty string on delete
                  if (!url) setShowImageUpload(false);
                }}
                disabled={isPosting}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting || !!imageUrl} // Disable if image already uploaded or posting
              >
                <ImageIcon className="size-4 mr-2" />
                Imagen
              </Button>
            </div>
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default CreatePost;

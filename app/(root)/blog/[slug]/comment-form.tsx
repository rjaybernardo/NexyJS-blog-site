"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions/comment.actions";

export default function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(addComment, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <Textarea
        name="content"
        required
        minLength={2}
        maxLength={2000}
        rows={3}
        placeholder="Share your thoughts..."
        aria-label="Comment"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting..." : "Post comment"}
        </Button>
      </div>
    </form>
  );
}

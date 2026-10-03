import { z } from "zod";

// Trim and lowercase before checking the format
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

export const signInFormSchema = z.object({
  email,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email,
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  bio: z.string().trim().max(280, "Bio must be 280 characters or less"),
});

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only use a-z, 0-9 and dashes");

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: slugSchema,
  excerpt: z
    .string()
    .trim()
    .min(10, "Excerpt must be at least 10 characters")
    .max(300, "Excerpt must be 300 characters or less"),
  content: z.string().trim().min(20, "Content must be at least 20 characters"),
  coverImage: z.url("Cover image must be a URL").nullable(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  tagIds: z.array(z.uuid()),
});

export const updatePostSchema = postSchema.extend({
  id: z.uuid(),
});

export const tagSchema = z.object({
  name: z.string().trim().min(2, "Tag must be at least 2 characters").max(32),
});

export const commentSchema = z.object({
  postId: z.uuid(),
  content: z
    .string()
    .trim()
    .min(2, "Comment is too short")
    .max(2000, "Comment must be 2000 characters or less"),
});

export const subscribeSchema = z.object({ email });

export const updateUserRoleSchema = z.object({
  id: z.uuid(),
  role: z.enum(["user", "admin"]),
});

const newPassword = z.string().min(8, "Password must be at least 8 characters").max(128);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(128),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

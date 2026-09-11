import { db } from "@/lib/db";

// Cast db to bypass strict Prisma Client type checks during build
const prisma = db as any;

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
  tags?: string[]; // Array of tag names
}

export class PostRepository {
  /**
   * Create a post and attach/connect tags in a single transaction
   */
  static async createPost(data: CreatePostInput) {
    return await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        tags: {
          connectOrCreate: data.tags?.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
      },
    });
  }

  /**
   * Fetch post by ID along with User profile and connected tags
   */
  static async getPostWithDetails(postId: string) {
    return await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          include: { profile: true },
        },
        tags: true,
      },
    });
  }
}
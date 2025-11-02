import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HttpResponse } from "@/lib/response";
import { getNextAuthSessionAsync } from "@/lib/auth";

const SYSTEM_PROMPT = `You are an expert resume writing assistant with years of experience in career coaching and recruitment. Your role is to help users create compelling, professional resumes that stand out to employers.

Key guidelines:
- Be concise, actionable, and specific in your advice
- Use the STAR method (Situation, Task, Action, Result) for describing experiences
- Focus on achievements and metrics rather than responsibilities
- Use strong action verbs (Led, Developed, Achieved, Increased, etc.)
- Tailor advice to modern resume best practices
- Be encouraging and supportive
- When suggesting text, format it in clean markdown
- Always consider the user's current resume context

Skills you can help with:
- Writing compelling professional summaries
- Crafting impactful job descriptions
- Quantifying achievements with metrics
- Improving language and tone
- Structuring resume sections
- Suggesting relevant skills
- Grammar and clarity improvements
- Industry-specific advice`;

// Schema definitions
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]).openapi({
    description: "The role of the message sender",
    example: "user",
  }),
  content: z.string().min(1).openapi({
    description: "The content of the message",
    example: "Help me write a better summary for my resume",
  }),
});

const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .openapi({
      description: "Array of conversation messages",
      example: [{ role: "user", content: "Help me improve my resume summary" }],
    }),
  currentResume: z.string().optional().openapi({
    description: "The current resume content in markdown format",
    example:
      "# John Doe\n\n## Summary\n\nSoftware engineer with 5 years of experience...",
  }),
  documentTitle: z.string().optional().openapi({
    description: "The title of the current document",
    example: "My Professional Resume",
  }),
});

const chatResponseSchema = z.object({
  message: z.string().openapi({
    description: "The AI-generated response message",
    example:
      "Here's a stronger summary for your resume that highlights your key achievements...",
  }),
  success: z.boolean().openapi({
    description: "Indicates if the request was successful",
    example: true,
  }),
});

// Route definitions
const chatRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: chatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "AI response generated successfully",
      content: {
        "application/json": {
          schema: chatResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - Invalid data",
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    500: {
      description: "Internal server error - AI processing failed",
    },
  },
  tags: ["AI Assistant"],
});

const aiApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return HttpResponse.error(c, {
        message: result.error.message,
        status: 400,
      });
    }
    return result;
  },
});

aiApp.openapi(chatRoute, async (c) => {
  try {
    // Check authentication
    const session = await getNextAuthSessionAsync();
    if (!session?.user) {
      return c.json({ error: "Unauthorized. Please sign in." }, 401);
    }

    const body = c.req.valid("json");
    const { messages, currentResume, documentTitle } = body;

    // Get Cloudflare context for AI
    const context = getCloudflareContext({ async: false });

    // Build the conversation with context
    const conversationMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];

    // Add resume context if available
    if (currentResume && currentResume.trim().length > 0) {
      conversationMessages.push({
        role: "user",
        content: `Current resume content (title: "${documentTitle || "Untitled"}"):\n\n${currentResume}\n\nUse this context to provide personalized advice.`,
      });
    }

    // Add conversation history
    conversationMessages.push(...messages);

    // Call Cloudflare AI
    const ai = context.env.AI;
    const aiResponse: { response?: string } = await ai.run(
      "@cf/meta/llama-3-8b-instruct",
      {
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1024,
      },
    );

    // Extract the response
    const assistantMessage: string =
      aiResponse?.response ||
      "I apologize, but I couldn't generate a response. Please try again.";

    return c.json({ message: assistantMessage, success: true });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return c.json(
      {
        error: "Failed to process your request. Please try again.",
        message:
          "I apologize, but I encountered an error. Please try again in a moment.",
      },
      500,
    );
  }
});

export default aiApp;

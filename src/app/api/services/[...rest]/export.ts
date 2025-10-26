import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HttpResponse } from "@/lib/response";
import { generatePdfResponse } from "@/lib/pdf";
import { getNextAuthSessionAsync } from "@/lib/auth";

const exportPdfSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "The title of the document",
    example: "My Resume",
  }),
  content: z.string().min(1).max(500000).openapi({
    description: "The markdown content of the document (max 500KB)",
    example: "# My Resume\n\n## Experience\n\n- Software Engineer at Company X",
  }),
});

const exportPdf = createRoute({
  method: "post",
  path: "/pdf",
  request: {
    body: {
      content: {
        "application/json": {
          schema: exportPdfSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "PDF file generated successfully",
      content: {
        "application/pdf": {
          schema: z.any(),
        },
      },
    },
    400: {
      description: "Bad request - Invalid data",
    },
    500: {
      description: "Failed to generate PDF",
    },
  },
});

const exportApp = new OpenAPIHono({
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

exportApp.openapi(exportPdf, async (c) => {
  const body = c.req.valid("json");
  const session = await getNextAuthSessionAsync();
  const rateLimitKey = session?.user?.id
    ? `user:${session.user.id}`
    : "anonymous";

  try {
    // Get Cloudflare Browser binding
    const env = getCloudflareContext({ async: false }).env;
    const ratelimit = await env.PDF_EXPORT_RATE_LIMITER.limit({
      key: rateLimitKey,
    });

    if (!ratelimit.success) {
      return c.json({ error: "Rate limit exceeded" }, 429);
    }

    const browserBinding = env.BROWSER;

    // Generate and return PDF response
    return await generatePdfResponse(browserBinding, body.title, body.content);
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate PDF";
    return c.json({ error: errorMessage }, 500);
  }
});

export default exportApp;

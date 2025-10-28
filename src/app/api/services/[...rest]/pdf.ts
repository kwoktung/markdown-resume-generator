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

const exportPdfResponseSchema = z.object({
  id: z.string(),
});

const exportPdf = createRoute({
  method: "post",
  path: "/export",
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
        "application/json": {
          schema: exportPdfResponseSchema,
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

export const getPdf = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: "PDF file downloaded successfully",
      content: {
        "application/pdf": {
          schema: z.any(),
        },
      },
    },
    404: {
      description: "PDF file not found",
    },
    500: {
      description: "Failed to download PDF",
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

    const id = crypto.randomUUID();

    env.KV.put(
      `pdf_export:${id}`,
      JSON.stringify({ title: body.title, content: body.content }),
      { expirationTtl: 60 },
    );

    const browserBinding = env.BROWSER;
    await generatePdfResponse(browserBinding, body.title, body.content);

    // Generate and return PDF response
    return c.json({ id }, 200);
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate PDF";
    return c.json({ error: errorMessage }, 500);
  }
});

exportApp.openapi(getPdf, async (c) => {
  const { id } = c.req.valid("param");

  try {
    // Get Cloudflare Browser binding
    const env = getCloudflareContext({ async: false }).env;
    const pdfData = await env.KV.get(`pdf_export:${id}`);
    if (!pdfData) {
      return c.json({ error: "PDF not found" }, 404);
    }

    const { title, content } = JSON.parse(pdfData);

    const browserBinding = env.BROWSER;

    const pdfResponse = await generatePdfResponse(
      browserBinding,
      title,
      content,
    );

    return pdfResponse;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to download PDF";
    return c.json({ error: errorMessage }, 500);
  }
});

export default exportApp;

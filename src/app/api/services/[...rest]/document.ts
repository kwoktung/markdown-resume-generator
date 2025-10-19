import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createContext } from "@/lib/context";
import { Services } from "@/services";
import { HttpResponse } from "@/lib/response";
import { getNextAuthSessionAsync } from "@/lib/auth";
import { markdownToHtml } from "@/lib/markdown";
import {
  generatePdfFromMarkdown,
  getPdfFilename,
  getPdfHeaders,
} from "@/lib/pdf";

const createDocumentSchema = z.object({
  title: z.string().min(1).openapi({
    description: "The title of the document",
    example: "My Resume",
  }),
  content: z.string().default("").openapi({
    description: "The markdown content of the document",
    example: "# My Resume\n\n## Experience\n\n- Software Engineer at Company X",
  }),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

const createDocumentResponseSchema = z.object({
  id: z.number(),
  success: z.boolean(),
});

const updateDocumentResponseSchema = z.object({
  id: z.number(),
  success: z.boolean(),
});

const deleteDocumentResponseSchema = z.object({
  id: z.number(),
  success: z.boolean(),
});

const documentSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  userId: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

const listDocumentsResponseSchema = z.object({
  documents: z.array(documentSchema),
  total: z.number(),
});

const getDocumentResponseSchema = z.object({
  document: documentSchema,
});

const searchDocumentsSchema = z.object({
  query: z.string().min(1).openapi({
    description: "Search query for document title",
    example: "resume",
  }),
});

const duplicateDocumentResponseSchema = z.object({
  document: documentSchema,
  success: z.boolean(),
});

const createDocument = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createDocumentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: createDocumentResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - Invalid data",
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    403: {
      description: "Forbidden - Maximum document limit reached",
    },
  },
});

const updateDocument = createRoute({
  method: "put",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateDocumentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: updateDocumentResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - Invalid data",
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    404: {
      description: "Document not found",
    },
  },
});

const deleteDocument = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: deleteDocumentResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    404: {
      description: "Document not found",
    },
  },
});

const getDocument = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: getDocumentResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    404: {
      description: "Document not found",
    },
  },
});

const listDocuments = createRoute({
  method: "get",
  path: "/",
  request: {
    query: z.object({
      offset: z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
      limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
    }),
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: listDocumentsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
  },
});

const searchDocuments = createRoute({
  method: "get",
  path: "/search",
  request: {
    query: searchDocumentsSchema,
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: listDocumentsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
  },
});

const duplicateDocument = createRoute({
  method: "post",
  path: "/{id}/duplicate",
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: duplicateDocumentResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - User not authenticated",
    },
    404: {
      description: "Document not found",
    },
  },
});

const generatePdf = createRoute({
  method: "post",
  path: "/{id}/pdf",
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
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
    401: {
      description: "Unauthorized - User not authenticated",
    },
    404: {
      description: "Document not found",
    },
    500: {
      description: "Failed to generate PDF",
    },
  },
});

const documentApp = new OpenAPIHono({
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

documentApp.openapi(createDocument, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  // Check if user has reached the maximum document limit
  const documentCount = await services.document.getDocumentsCount(
    session.user.id,
  );
  if (documentCount >= 50) {
    return c.json({ error: "Maximum document limit of 50 reached" }, 403);
  }

  const document = await services.document.createDocument({
    title: body.title,
    content: body.content,
    userId: session.user.id,
  });
  return c.json({ id: document.id, success: true });
});

documentApp.openapi(updateDocument, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const result = await services.document.updateDocument(
    id,
    session.user.id,
    body,
  );
  if (!result) {
    return c.json({ error: "Document not found" }, 404);
  }
  return c.json({ id, success: true });
});

documentApp.openapi(deleteDocument, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.valid("param");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const result = await services.document.deleteDocument(id, session.user.id);
  if (!result) {
    return c.json({ error: "Document not found" }, 404);
  }
  return c.json({ id, success: true });
});

documentApp.openapi(getDocument, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.valid("param");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const document = await services.document.getDocumentById(id, session.user.id);
  if (!document) {
    return c.json({ error: "Document not found" }, 404);
  }
  return c.json({ document });
});

documentApp.openapi(listDocuments, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { offset, limit } = c.req.valid("query");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const documents = await services.document.getDocuments(
    session.user.id,
    limit,
    offset,
  );
  const total = await services.document.getDocumentsCount(session.user.id);

  return c.json({
    documents,
    total,
  });
});

documentApp.openapi(searchDocuments, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { query } = c.req.valid("query");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const documents = await services.document.searchDocuments(
    session.user.id,
    query,
  );
  return c.json({
    documents,
    total: documents.length,
  });
});

documentApp.openapi(duplicateDocument, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.valid("param");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  const document = await services.document.duplicateDocument(
    id,
    session.user.id,
  );
  return c.json({ document, success: true });
});

documentApp.openapi(generatePdf, async (c) => {
  const session = await getNextAuthSessionAsync();
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.valid("param");
  const ctx = createContext(getCloudflareContext({ async: false }).env);
  const services = new Services(ctx);

  try {
    // Get document
    const document = await services.document.getDocumentById(
      id,
      session.user.id,
    );
    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Convert markdown to HTML
    const html = markdownToHtml(document.content);

    // Get Cloudflare Browser binding
    const env = getCloudflareContext({ async: false }).env;
    const browserBinding = env.BROWSER;

    if (!browserBinding) {
      return c.json({ error: "Browser rendering not available" }, 500);
    }

    // Generate PDF
    const pdfBuffer = await generatePdfFromMarkdown(
      browserBinding,
      html,
      document.title,
    );

    // Get PDF filename and headers
    const filename = getPdfFilename(document.title);
    const headers = getPdfHeaders(filename);

    // Return PDF
    return new Response(Buffer.from(pdfBuffer), {
      headers,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return c.json({ error: "Failed to generate PDF" }, 500);
  }
});

export default documentApp;

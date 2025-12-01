import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import documentApp from "./document";
import aiApp from "./ai";
import pdfApp from "./pdf";

const basePath = "/api/services";

const app = new OpenAPIHono().basePath(basePath);

app.route("/document", documentApp);
app.route("/ai/chat", aiApp);
app.route("/pdf", pdfApp);
app.doc31("/docs", {
  openapi: "3.1.0",
  info: {
    title: "Markdown Pro API",
    version: "1.0.0",
    description:
      "API for managing markdown documents with AI-powered assistance",
  },
  servers: [
    {
      url: basePath,
      description: "API Server",
    },
  ],
});
app.get(
  "/scalar",
  Scalar({
    url: `${basePath}/docs`,
    title: "Markdown Pro API",
  }),
);

export const GET = (req: Request) => app.fetch(req);
export const POST = (req: Request) => app.fetch(req);
export const PUT = (req: Request) => app.fetch(req);
export const DELETE = (req: Request) => app.fetch(req);
export const PATCH = (req: Request) => app.fetch(req);

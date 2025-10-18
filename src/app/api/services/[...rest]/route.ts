import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import documentApp from "./document";

const basePath = "/api/services";

const app = new OpenAPIHono().basePath(basePath);

app.route("/document", documentApp);
app.doc31("/docs", {
  openapi: "3.1.0",
  info: {
    title: "Markdown Resume API",
    version: "1.0.0",
  },
});
app.get(
  "/scalar",
  Scalar({
    url: `${basePath}/docs`,
    title: "Markdown Resume API",
  }),
);

export const GET = (req: Request) => app.fetch(req);
export const POST = (req: Request) => app.fetch(req);
export const PUT = (req: Request) => app.fetch(req);
export const DELETE = (req: Request) => app.fetch(req);
export const PATCH = (req: Request) => app.fetch(req);

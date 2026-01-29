
import { z } from "zod";
import { insertPasteSchema, pastes } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  healthz: {
    method: "GET" as const,
    path: "/api/healthz",
    responses: {
      200: z.object({ ok: z.boolean() }),
    },
  },
  pastes: {
    create: {
      method: "POST" as const,
      path: "/api/pastes",
      input: insertPasteSchema,
      responses: {
        201: z.object({
          id: z.string(),
          url: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/pastes/:id",
      responses: {
        200: z.object({
          content: z.string(),
          remaining_views: z.number().nullable(),
          expires_at: z.string().nullable(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreatePasteInput = z.infer<typeof api.pastes.create.input>;
export type CreatePasteResponse = z.infer<typeof api.pastes.create.responses[201]>;
export type GetPasteResponse = z.infer<typeof api.pastes.get.responses[200]>;

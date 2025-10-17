import { documentTable } from "@/database/schema";
import { BaseService } from "./service";
import { eq, like, and, isNull, desc } from "drizzle-orm";
import type { Context } from "./service";
import { sql } from "drizzle-orm";

// Define Document types
export type Document = typeof documentTable.$inferSelect;
export type NewDocument = typeof documentTable.$inferInsert;

export class DocumentService extends BaseService {
  constructor(ctx: Context) {
    super(ctx);
  }

  /**
   * Get all documents for a user
   */
  async getDocuments(userId: string, limit?: number, offset?: number) {
    const query = this.ctx.db.query.documentTable.findMany({
      where: and(
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
      ),
      orderBy: [desc(documentTable.updatedAt)],
      limit,
      offset,
    });
    return query;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: number, userId: string) {
    return this.ctx.db.query.documentTable.findFirst({
      where: and(
        eq(documentTable.id, id),
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
      ),
    });
  }

  /**
   * Create new document
   */
  async createDocument(
    documentData: Omit<
      NewDocument,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ) {
    const now = new Date();
    const newDocument = {
      ...documentData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.ctx.db
      .insert(documentTable)
      .values(newDocument)
      .returning();

    // Get the inserted document ID and return the new document
    const documentId = result[0].id as number;
    return {
      id: documentId,
      ...newDocument,
    };
  }

  /**
   * Update document
   */
  async updateDocument(
    id: number,
    userId: string,
    documentData: Partial<
      Omit<NewDocument, "id" | "createdAt" | "deletedAt" | "userId">
    >,
  ) {
    const now = new Date();
    const updateData = {
      ...documentData,
      updatedAt: now,
    };

    const result = await this.ctx.db
      .update(documentTable)
      .set(updateData)
      .where(
        and(
          eq(documentTable.id, id),
          eq(documentTable.userId, userId),
          isNull(documentTable.deletedAt),
        ),
      )
      .returning();

    return result[0];
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(id: number, userId: string) {
    const now = new Date();
    const result = await this.ctx.db
      .update(documentTable)
      .set({
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(documentTable.id, id),
          eq(documentTable.userId, userId),
          isNull(documentTable.deletedAt),
        ),
      );

    return result;
  }

  /**
   * Hard delete document (completely remove from database)
   */
  async hardDeleteDocument(id: number, userId: string) {
    const result = await this.ctx.db
      .delete(documentTable)
      .where(and(eq(documentTable.id, id), eq(documentTable.userId, userId)));

    return result;
  }

  /**
   * Search documents by title
   */
  async searchDocuments(
    userId: string,
    query: string,
    limit?: number,
    offset?: number,
  ) {
    const searchQuery = `%${query}%`;

    return this.ctx.db.query.documentTable.findMany({
      where: and(
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
        like(documentTable.title, searchQuery),
      ),
      orderBy: [desc(documentTable.updatedAt)],
      limit,
      offset,
    });
  }

  /**
   * Get documents count for a user
   */
  async getDocumentsCount(userId: string) {
    const result = await this.ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(documentTable)
      .where(
        and(eq(documentTable.userId, userId), isNull(documentTable.deletedAt)),
      );

    return result[0]?.count || 0;
  }

  /**
   * Check if document exists
   */
  async documentExists(id: number, userId: string) {
    const document = await this.getDocumentById(id, userId);
    return !!document;
  }

  /**
   * Restore deleted document
   */
  async restoreDocument(id: number, userId: string) {
    const now = new Date();
    const result = await this.ctx.db
      .update(documentTable)
      .set({
        deletedAt: null,
        updatedAt: now,
      })
      .where(and(eq(documentTable.id, id), eq(documentTable.userId, userId)));

    return result;
  }

  /**
   * Get deleted documents
   */
  async getDeletedDocuments(userId: string, limit?: number, offset?: number) {
    return this.ctx.db.query.documentTable.findMany({
      where: and(
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
      ),
      orderBy: [desc(documentTable.deletedAt)],
      limit,
      offset,
    });
  }

  /**
   * Duplicate document
   */
  async duplicateDocument(id: number, userId: string) {
    const document = await this.getDocumentById(id, userId);
    if (!document) {
      throw new Error("Document not found");
    }

    const now = new Date();
    const newDocument = {
      title: `${document.title} (Copy)`,
      content: document.content,
      userId: document.userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.ctx.db
      .insert(documentTable)
      .values(newDocument)
      .returning();
    return result[0];
  }
}

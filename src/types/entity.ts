import {
  accountTable,
  sessionTable,
  userTable,
  verificationTokenTable,
  bookTable,
  documentTable,
} from "@/database/schema";

export type AccountItem = typeof accountTable.$inferSelect;
export type NewAccountItem = typeof accountTable.$inferInsert;
export type SessionItem = typeof sessionTable.$inferSelect;
export type NewSessionItem = typeof sessionTable.$inferInsert;
export type UserItem = typeof userTable.$inferSelect;
export type NewUserItem = typeof userTable.$inferInsert;
export type VerificationTokenItem = typeof verificationTokenTable.$inferSelect;
export type NewVerificationTokenItem =
  typeof verificationTokenTable.$inferInsert;

// Book types
export type BookItem = typeof bookTable.$inferSelect;
export type NewBookItem = typeof bookTable.$inferInsert;

// Document types
export type DocumentItem = typeof documentTable.$inferSelect;
export type NewDocumentItem = typeof documentTable.$inferInsert;

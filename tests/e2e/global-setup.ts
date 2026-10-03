import { cleanUpE2eData, createTestDb } from "./db";

export default async function globalSetup() {
  const db = createTestDb();

  try {
    await cleanUpE2eData(db);
  } finally {
    await db.$disconnect();
  }
}

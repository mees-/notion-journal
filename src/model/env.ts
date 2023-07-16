export const NOTION_TOKEN = process.env.NOTION_TOKEN as string
if (!NOTION_TOKEN || typeof NOTION_TOKEN !== "string") {
  throw new Error("NOTION_TOKEN is not set")
}

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID as string
if (!NOTION_DATABASE_ID || typeof NOTION_DATABASE_ID !== "string") {
  throw new Error("NOTION_DATABASE_ID is not set")
}

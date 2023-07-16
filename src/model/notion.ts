import { Client } from "@notionhq/client"
import { NOTION_DATABASE_ID, NOTION_TOKEN } from "./env"
import { BlockObjectResponse, PageObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import slugify from "slugify"
import { DateTime } from "luxon"

const notion = new Client({
  auth: NOTION_TOKEN,
})

function isNotNull<TValue>(value: TValue | undefined | null): value is TValue {
  return value !== null && value !== undefined // Can also be `!!value`.
}

export async function getPosts() {
  const response = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
  })

  const allPages = response.results.map(page => {
    try {
      const fullPage = page as PageObjectResponse
      if (fullPage.properties != null) {
        return {
          ...getPageProps(fullPage),
        }
      }
      return null
    } catch (e) {
      console.error("error", e)
      return null
    }
  })
  return allPages.filter(isNotNull).filter(page => page.publish)
}

export async function getPage(id: string) {
  const pageData = await notion.pages.retrieve({ page_id: id })
  const fullPage = pageData as PageObjectResponse
  const pageContent = await getChildBlocks(id)
  return {
    ...getPageProps(fullPage),
    blocks: pageContent,
  }
}

function getPageProps(page: PageObjectResponse) {
  const fullPage = page as PageObjectResponse
  const title = fullPage.properties.Name.type === "title" ? fullPage.properties.Name.title[0].plain_text : null
  const dateRaw = fullPage.properties.Date.type === "date" ? fullPage.properties.Date.date?.start : null
  const date = dateRaw ? DateTime.fromISO(dateRaw) : null
  const location = fullPage.properties.Location.type === "rich_text" ? fullPage.properties.Location.rich_text : null
  const publish = fullPage.properties.Publish.type === "checkbox" ? fullPage.properties.Publish.checkbox : false
  return {
    id: page.id,
    title,
    date,
    location,
    publish,
  }
}

export async function getChildBlocks(blockId: string) {
  const childBlocks = await notion.blocks.children.list({ block_id: blockId })
  return childBlocks.results as BlockObjectResponse[]
}

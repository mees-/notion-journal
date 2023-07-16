import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CodeBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ImageBlockObjectResponse,
  LinkToPageBlockObjectResponse,
  MentionRichTextItemResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  RichTextItemResponse,
  VideoBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import clsx from "clsx"
import { DateTime } from "luxon"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getChildBlocks, getPage, getPosts } from "~/model/notion"

export async function generateStaticParams() {
  return getPosts()
}

export const revalidate = 60 * 60 // 24 hours

type PageProps = {
  params: {
    id: string
  }
}
export default async function Page({ params: { id } }: PageProps) {
  const { title, date, location, publish, blocks } = await getPage(id)
  if (!publish) {
    return notFound()
  }

  return (
    <>
      <h1 className="font-black text-3xl">{title}</h1>
      {date && <h2>{date.toLocaleString(DateTime.DATE_FULL)}</h2>}
      {date && <h2>{date.toLocaleString(DateTime.TIME_24_SIMPLE)}</h2>}
      {blocks.map(block => (
        <div key={block.id} className="my-3">
          <Block block={block} />
        </div>
      ))}
    </>
  )
}

function Block({ block }: { block: BlockObjectResponse }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} />
    case "image":
      return <ImageBlock block={block} />
    case "video":
      return <VideoBlock block={block} />
    case "heading_1":
    case "heading_2":
    case "heading_3":
      return <HeadingBlock block={block} />
    case "divider":
      return <hr />
    case "bulleted_list_item":
    case "numbered_list_item":
      return <ListItemBlock block={block} />
    case "code":
      return <CodeBlock block={block} />
    case "link_to_page":
      return <LinkToPageBlock block={block} />
    default:
      console.log(`Unsupported block type: ${block.type}`)
      return null
  }
}

function HeadingBlock({
  block,
}: {
  block: Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse
}) {
  const heading =
    block.type === "heading_1" ? block.heading_1 : block.type === "heading_2" ? block.heading_2 : block.heading_3
  const level = block.type === "heading_1" ? 1 : block.type === "heading_2" ? 2 : 3
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <Tag
      className={clsx(
        level === 1 && "text-4xl font-bold",
        level === 2 && "text-2xl font-semibold",
        level === 3 && "text-xl font-medium",
        "mb-4",
      )}
    >
      {heading.rich_text.map((text, idx) => (
        <RichText key={idx} item={text} />
      ))}
    </Tag>
  )
}

function ParagraphBlock({ block }: { block: ParagraphBlockObjectResponse }) {
  return (
    <p>
      {block.paragraph.rich_text.map((text, idx) => (
        <RichText key={idx} item={text} />
      ))}
    </p>
  )
}

function RichText({ item }: { item: RichTextItemResponse }) {
  const { bold, code, color, italic, strikethrough, underline } = item.annotations

  switch (item.type) {
    case "text":
      const className = clsx(
        bold && "font-bold",
        code && "font-mono rounded p-[2px] bg-gray-200",
        italic && "italic",
        strikethrough && "line-through",
        underline && "underline",
        color && `text-${color}`,
      )
      if (item.href) {
        return (
          <Link href={item.href} className={clsx(className, "underline")}>
            {item.plain_text}
          </Link>
        )
      } else {
        return <span className={className}>{item.plain_text}</span>
      }
    case "mention":
      return <RichTextMention item={item} />
    case "equation":
      return (
        <span
          className={clsx(
            bold && "font-bold",
            code && "font-mono drop-shadow-lg rounded p-4",
            italic && "italic",
            strikethrough && "line-through",
            underline && "underline",
            color && `text-${color}`,
          )}
        >
          {item.equation.expression}
        </span>
      )
    default:
      return <></>
  }
}

function RichTextMention({ item }: { item: MentionRichTextItemResponse }) {
  switch (item.mention.type) {
    case "date":
    case "user":
      return <span className="font-semibold">{item.plain_text}</span>
    case "page":
    case "database":
    case "link_preview":
      return (
        <Link className="font-semibold" href={item.href!}>
          {item.plain_text}
        </Link>
      )
    default:
      return <></>
  }
}

function ImageBlock({ block }: { block: ImageBlockObjectResponse }) {
  const url = block.image.type === "external" ? block.image.external.url : block.image.file.url

  return (
    <div>
      <img src={url} />
      {block.image.caption && (
        <figcaption>
          {block.image.caption.map((c, idx) => (
            <RichText key={idx} item={c} />
          ))}
        </figcaption>
      )}
    </div>
  )
}

function VideoBlock({ block }: { block: VideoBlockObjectResponse }) {
  const url = block.video.type === "external" ? block.video.external.url : block.video.file.url
  return (
    <div>
      <video src={url} />
      {block.video.caption && (
        <figcaption>
          {block.video.caption.map((c, idx) => (
            <RichText key={idx} item={c} />
          ))}
        </figcaption>
      )}
    </div>
  )
}

async function ListItemBlock({
  block,
}: {
  block: BulletedListItemBlockObjectResponse | NumberedListItemBlockObjectResponse
}) {
  const { rich_text } = block.type === "bulleted_list_item" ? block.bulleted_list_item : block.numbered_list_item

  return (
    <li className="list-inside">
      {rich_text.map((text, idx) => (
        <RichText key={idx} item={text} />
      ))}
      {block.has_children && (await getChildBlocks(block.id)).map(child => <Block key={child.id} block={child} />)}
    </li>
  )
}

function CodeBlock({ block }: { block: CodeBlockObjectResponse }) {
  return (
    <pre>
      <code>
        {block.code.rich_text.map((text, idx) => (
          <RichText key={idx} item={text} />
        ))}
      </code>
    </pre>
  )
}

async function LinkToPageBlock({ block }: { block: LinkToPageBlockObjectResponse }) {
  if (block.link_to_page.type === "page_id") {
    const pageId = block.link_to_page.page_id
    const { title } = await getPage(pageId)
    return (
      <Link className="underline" href={`/${pageId}`}>
        {title}
      </Link>
    )
  } else {
    return <span className="text-gray-300">Unresolved page link</span>
  }
}

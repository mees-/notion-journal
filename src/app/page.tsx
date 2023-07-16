import { DateTime } from "luxon"
import Link from "next/link"
import { getPosts } from "~/model/notion"

export const revalidate = 60 * 15 // 15 minutes

export default async function Home() {
  const posts = (await getPosts()).sort((a, b) => {
    if (a.date && b.date) {
      return a.date.toMillis() > b.date.toMillis() ? -1 : 1
    }
    if (a.date) {
      return -1
    }
    if (b.date) {
      return 1
    }
    return 0
  })
  return (
    <>
      <main className="mx-4 sm:mx-10 p-4 md:mx-auto md:w-5/6 lg:w-2/3 xl:w-1/2">
        <ol>
          {posts.map(post => (
            <li key={post.id} className="my-1 font-semibold text-orange-700">
              <Link href={`/${post.id}`}>
                {post.title} - {post.date?.toLocaleString(DateTime.DATE_SHORT)}
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </>
  )
}

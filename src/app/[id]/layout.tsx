import Link from "next/link"
import { PropsWithChildren } from "react"

export default function PostLayout({
  children,
  params: { id: selectedId },
}: PropsWithChildren<{ params: { id: string } }>) {
  return (
    <>
      <Link href="/">
        <div className="pl-4 mx-4 sm:mx-10 md:mx-auto md:w-5/6 lg:w-2/3 xl:w-1/2 text-blue-400 hover:text-blue-600 font-bold text-lg">
          Back
        </div>
      </Link>
      <main className="mx-4 sm:mx-10 p-4 md:mx-auto md:w-5/6 lg:w-2/3 xl:w-1/2">{children}</main>
    </>
  )
}

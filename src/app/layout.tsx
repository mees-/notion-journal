import Link from "next/link"
import "./globals.css"

export const metadata = {
  title: "Mees' Journal",
  description: "A journal with technical journal entries",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-screen min-h-screen bg-orange-50 flex flex-col">
        <header className="mx-4 sm:mx-10 p-4 md:mx-auto md:w-5/6 lg:w-2/3 xl:w-1/2">
          <Link href="/">
            <h1 className="text-5xl text-sky-700 font-bold">{metadata.title}</h1>
          </Link>
        </header>
        <div className="grow">{children}</div>
        <footer className="mx-4 sm:mx-10 p-4 md:mx-auto md:w-5/6 lg:w-2/3 xl:w-1/2">
          {"Made by Mees van Dijk <mees@mees.io>"}
        </footer>
      </body>
    </html>
  )
}

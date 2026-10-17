import { getDataCache } from "@/lib/cache/cache"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params

  const item = getDataCache(name)

  if (!item) {
    return new Response("Not found", { status: 404 })
  }

  const isDev = process.env.NODE_ENV !== "production"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": isDev ? "no-cache, no-store, must-revalidate" : "public, max-age=300"
  }

  if (item.type === "br") {
    headers["Content-Encoding"] = "br"
  }

  return new Response(new Uint8Array(item.buf), { headers })
}
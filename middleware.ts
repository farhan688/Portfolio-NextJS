import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !isValidAuthHeader(authHeader)) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    })
  }

  return NextResponse.next()
}

function isValidAuthHeader(authHeader: string) {
  const base64Credentials = authHeader.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export const config = {
  matcher: "/admin/:path*",
} 
import { type NextRequest } from "next/server"

// Redirect to working auth verify route
export async function GET(request: NextRequest) {
  const { GET: authVerify } = await import("../auth/verify/route")
  return authVerify(request)
}

export const dynamic = "force-dynamic"

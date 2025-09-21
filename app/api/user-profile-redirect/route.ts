import { type NextRequest } from "next/server"

// Redirect to working auth profile route
export async function GET(request: NextRequest) {
  const { GET: authProfile } = await import("../auth/profile/route")
  return authProfile(request)
}

export const dynamic = "force-dynamic"

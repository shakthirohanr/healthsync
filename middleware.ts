import { auth } from "~/server/auth"

export const config = {
  matcher: ["/dashboard/:path*"],
}

export default auth
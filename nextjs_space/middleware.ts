
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Adicionales middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/transacciones/:path*', '/cuentas/:path*', '/presupuestos/:path*', '/analisis/:path*']
}

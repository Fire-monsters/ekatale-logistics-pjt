// services/auth-service/src/server.ts

import app        from './app'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT ?? 3001

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(PORT, () => {
      console.log(`🚀 Auth service running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start:', error)
    process.exit(1)
  }
}

main()
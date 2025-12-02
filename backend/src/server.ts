import dotenv from 'dotenv'
import app from './app'
import prisma from './services/prisma.service'

dotenv.config()

const PORT = process.env.PORT || 4000

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`)
  console.log(`Google OAuth route: http://localhost:${PORT}/api/auth/v1/google`)
  try {
    await prisma.$connect()
    console.log('Prisma connected to DB')
  } catch (err) {
    console.error('Prisma failed to connect:', err)
  }
})




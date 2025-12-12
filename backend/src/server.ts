import dotenv from 'dotenv'
import app from './app'
import prisma from './services/prisma.service'
import { syncPendingDonations } from './controllers/donations.controller'

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

  // Background poller to auto-complete pending Xendit payments if webhook is missing.
  const interval = Number(process.env.PAYMENT_SYNC_INTERVAL_MS || 60000)
  setInterval(() => {
    syncPendingDonations().catch((err) =>
      console.error('Sync pending donations failed', err)
    )
  }, interval)
})




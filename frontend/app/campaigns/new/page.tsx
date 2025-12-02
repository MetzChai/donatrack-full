'use client'

import { useState } from 'react'
import { createCampaign } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedPage from '../../../components/ProtectedPage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function NewCampaignPageContent() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN'

  async function handleSubmit(e: any) {
    e.preventDefault()
    const token = localStorage.getItem("token");
    if (!token) {
      alert('Please login to create a campaign')
      router.push('/auth/login')
      return
    }

    if (!isAdmin) {
      alert('Only administrators can create campaigns')
      return
    }

    if (!title || !description || !goalAmount) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await createCampaign(
        {
          title,
          description,
          goalAmount: Number(goalAmount),
          imageUrl: imageUrl || undefined,
        },
        token
      )
      router.push('/campaigns')
    } catch (err: any) {
      alert(err.error || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <main className="p-8 min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Only administrators can create campaigns.</p>
          <Link href="/" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded">
            Go Back
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto">
        <Link href="/campaigns" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-semibold mb-2">Campaign Title *</label>
            <input
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
              placeholder="Enter campaign title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
              placeholder="Describe your campaign and its purpose"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Goal Amount (PHP) *</label>
            <input
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
              placeholder="Enter goal amount"
              type="number"
              step="0.01"
              min="1"
              value={goalAmount}
              onChange={e => setGoalAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Image URL (Optional)</label>
            <input
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
              placeholder="https://example.com/image.jpg"
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-semibold"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function NewCampaignPage() {
  return (
    <ProtectedPage requiredRole="ADMIN">
      <NewCampaignPageContent />
    </ProtectedPage>
  )
}

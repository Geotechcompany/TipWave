import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Music, DollarSign, Users } from 'lucide-react'

import CurrencySwitcher from './switchers/currencySwitcher';


export default function DJDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [queue, setQueue] = useState([])
  const [stats, setStats] = useState({ earnings: 0, topSongs: [], frequentUsers: [] })

  useEffect(() => {
    // Fetch queue and stats
    // This is where you'd typically make API calls
    setQueue([
      { id: '1', title: 'Song 1', artist: 'Artist 1', bidAmount: 10 },
      { id: '2', title: 'Song 2', artist: 'Artist 2', bidAmount: 15 },
      { id: '3', title: 'Song 3', artist: 'Artist 3', bidAmount: 12 },
    ])
    setStats({
      earnings: 1000,
      topSongs: ['Song 1', 'Song 2', 'Song 3'],
      frequentUsers: ['User 1', 'User 2', 'User 3'],
    })
  }, [])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neon-blue">DJ Dashboard</h1>
        <CurrencySwitcher selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Music className="mr-2" /> Song Queue
          </h2>
          <div className="space-y-4">
            {queue.map((song) => (
              <div key={song.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div>
                  <h3 className="font-bold">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
                <div className="text-neon-pink font-bold">
                  {song.bidAmount} {selectedCurrency}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <DollarSign className="mr-2" /> DJ Stats
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Total Earnings</h3>
              <p className="text-2xl text-neon-pink">
                {stats.earnings} {selectedCurrency}
              </p>
            </div>
            <div>
              <h3 className="font-bold">Top Requested Songs</h3>
              <ul className="list-disc list-inside">
                {stats.topSongs.map((song, index) => (
                  <li key={index}>{song}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Most Frequent Users</h3>
              <ul className="list-disc list-inside">
                {stats.frequentUsers.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
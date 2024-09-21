import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Search, Music, DollarSign } from 'lucide-react'

import CurrencySwitcher from './CurrencySwitcher'
import SongSearch from './SongSearch'
import SongQueue from './SongQueue'
import BidModal from './BidModal'

export default function UserDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency)
  }

  const handleBid = (song) => {
    setSelectedSong(song)
    setShowBidModal(true)
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neon-blue">Welcome, {user.firstName}!</h1>
        <CurrencySwitcher selectedCurrency={selectedCurrency} onCurrencyChange={handleCurrencyChange} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Search className="mr-2" /> Search Songs
          </h2>
          <SongSearch onBid={handleBid} currency={selectedCurrency} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Music className="mr-2" /> Song Queue
          </h2>
          <SongQueue currency={selectedCurrency} />
        </motion.div>
      </div>

      {showBidModal && (
        <BidModal
          song={selectedSong}
          currency={selectedCurrency}
          onClose={() => setShowBidModal(false)}
          onBidPlaced={() => {
            setShowBidModal(false)
            // Refresh song queue
          }}
        />
      )}
    </div>
  )
}
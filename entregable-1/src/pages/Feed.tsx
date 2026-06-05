import { useState } from 'react'
import { motion } from 'framer-motion'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'
import FeedTabs from '../components/feed/FeedTabs'
import FilterChips from '../components/feed/FilterChips'
import FeedCard from '../components/feed/FeedCard'
import RankingStrip from '../components/feed/RankingStrip'
import { mockPosts } from '../data/mockData'

type Tab = 'para-ti' | 'tendencias' | 'recientes'

export default function Feed() {
  const [activeTab, setActiveTab] = useState<Tab>('para-ti')

  const filteredPosts = (() => {
    if (activeTab === 'tendencias') return mockPosts.filter((p) => p.isTrending)
    if (activeTab === 'recientes') return [...mockPosts].sort((a, b) => a.minutesAgo - b.minutesAgo)
    return mockPosts
  })()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-28 md:pb-8"
    >
      <TopBar />
      {/* Desktop header — only shown when TopBar is hidden */}
      <div className="hidden md:flex items-center justify-between px-4 py-4 border-b border-white/5">
        <h1
          className="text-white font-bold text-xl"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Para ti
        </h1>
      </div>
      <FeedTabs active={activeTab} onChange={setActiveTab} />
      <FilterChips />
      <RankingStrip />

      <div className="px-4 mt-2">
        {filteredPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>

      <BottomNav />
    </motion.div>
  )
}

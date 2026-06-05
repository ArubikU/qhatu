import { motion } from 'framer-motion'
import PostComposer from '../components/post/PostComposer'

export default function CreatePost() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <PostComposer />
    </motion.div>
  )
}

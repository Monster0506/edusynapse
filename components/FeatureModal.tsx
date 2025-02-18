"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeatureModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  featureName: string
}

export function FeatureModal({ isOpen, onClose, imageSrc, featureName }: FeatureModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-lg p-4 max-w-lg w-full mx-4 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">{featureName}</h3>
            <img src={imageSrc || "/placeholder.svg"} alt={featureName} className="w-full h-auto rounded-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


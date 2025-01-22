"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  productName: string
  videoUrl?: string | null
}

export function ImageGallery({ images, productName, videoUrl }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasVideo = Boolean(videoUrl)
  const totalItems = (hasVideo ? 1 : 0) + images.length

  const renderMainContent = () => {
    if (hasVideo && currentIndex === 0) {
      return (
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <video
            src={videoUrl!}
            controls
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )
    }

    const imageIndex = hasVideo ? currentIndex - 1 : currentIndex
    const imageUrl = images[imageIndex] || '/placeholder.jpg'

    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={currentIndex === 0}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Content */}
      {renderMainContent()}

      {/* Thumbnails */}
      {totalItems > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {/* Video Thumbnail */}
          {hasVideo && (
            <button
              onClick={() => setCurrentIndex(0)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                currentIndex === 0 ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <video
                src={videoUrl!}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="rounded-full bg-white/80 p-2">
                  <svg 
                    className="h-6 w-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}

          {/* Image Thumbnails */}
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(hasVideo ? idx + 1 : idx)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                currentIndex === (hasVideo ? idx + 1 : idx) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={url}
                alt={`${productName} ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 25vw, 15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 
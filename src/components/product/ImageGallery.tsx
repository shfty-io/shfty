"use client"

import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  productName: string
  videoUrl?: string | null
}

export function ImageGallery({ images, productName, videoUrl }: ImageGalleryProps) {
  const hasVideo = Boolean(videoUrl)
  const allMedia = hasVideo && videoUrl ? [videoUrl, ...images] : images

  if (allMedia.length === 0) {
    return null
  }

  return (
    <div className="max-w-9xl mx-auto px-4">
      <div className="grid grid-cols-2 gap-4">
        {allMedia.map((url, idx) => {
          // If it's a video (first item when hasVideo is true)
          if (hasVideo && idx === 0) {
            return (
              <div key="video" className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                <video
                  src={url}
                  controls
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )
          }

          // For images
          return (
            <div 
              key={idx} 
              className="relative aspect-video overflow-hidden rounded-lg bg-gray-100"
            >
              <Image
                src={url}
                alt={`${productName} ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
} 
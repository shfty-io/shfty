import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Review Guidelines | Marketplace',
  description: 'Learn about our product review process and requirements for listing your products on our marketplace.',
}

export default function ProductReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 
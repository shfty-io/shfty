interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null

  return (
    <div className="space-y-5">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        {description}
      </div>
    </div>
  )
} 
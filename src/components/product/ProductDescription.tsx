interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null

  return (
    <div className="space-y-5">
      <h4 className="body-m font-semibold">Description</h4>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        {description}
      </div>
    </div>
  )
} 
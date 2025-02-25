interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null

  return (
    <div className="space-y-5">
      <div 
        className="prose prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  )
} 
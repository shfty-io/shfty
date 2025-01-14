interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div className="prose max-w-none">
      <h2 className="text-lg font-semibold">Description</h2>
      <div 
        className="mt-2 text-gray-600"
        dangerouslySetInnerHTML={{ __html: description || '' }}
      />
    </div>
  )
} 
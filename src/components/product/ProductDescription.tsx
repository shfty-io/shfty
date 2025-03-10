interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null

  return (
    <div className="space-y-5">
      <style jsx global>{`
        /* Rich text styles for product description */
        .rich-text-h1 {
          font-size: 1.875rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
        }
        .rich-text-h2 {
          font-size: 1.5rem !important;
          font-weight: bold !important;
          margin-bottom: 0.75rem !important;
        }
        .rich-text-h3 {
          font-size: 1.25rem !important;
          font-weight: semibold !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-text-p {
          margin-bottom: 1rem !important;
        }
        .rich-text-ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin-bottom: 1rem !important;
        }
        .rich-text-ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin-bottom: 1rem !important;
        }
        .rich-text-li {
          margin-bottom: 0.25rem !important;
        }
        .rich-text-strong {
          font-weight: bold !important;
        }
        .rich-text-em {
          font-style: italic !important;
        }
        .rich-text-code {
          background-color: #f0f0f0 !important;
          padding: 0.1rem 0.2rem !important;
          border-radius: 0.2rem !important;
          font-family: monospace !important;
        }
        .rich-text-a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
      `}</style>
      <div 
        className="prose prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl max-w-none rich-text-content"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  )
} 
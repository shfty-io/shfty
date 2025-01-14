import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItem {
  question: string
  answer: string
}

interface ProductFAQProps {
  faq: FAQItem[] | null
}

export function ProductFAQ({ faq }: ProductFAQProps) {
  if (!Array.isArray(faq) || faq.length === 0) return null

  return (
    <div className="prose max-w-none">
      <h2 className="text-lg font-semibold mb-4">FAQ</h2>
      <Accordion type="single" collapsible className="w-full">
        {faq.map((item, index) => (
          item && typeof item === 'object' && 'question' in item && 'answer' in item ? (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ) : null
        ))}
      </Accordion>
    </div>
  )
} 
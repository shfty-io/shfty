"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureItem {
  question: string
  answer: string
}

interface ProductFeaturesProps {
  features: FeatureItem[] | null
}

export function ProductFeatures({ features }: ProductFeaturesProps) {
  if (!Array.isArray(features) || features.length === 0) return null

  return (
    <div className="space-y-5">
      <h4 className="body-m font-semibold">Features</h4>
      <div className="space-y-1" data-orientation="vertical">
        {features.map((item, index) => (
          <FeatureItem
            key={index}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  )
}

const FeatureItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string
    answer: string
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { question, answer } = props

  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "group overflow-hidden rounded-[10px] border border-gray-200 dark:border-white/10",
        "data-[state=open]:bg-surface-10"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 pl-4 font-medium"
      >
        <p className="body-xs text-start font-semibold">
          {question}
        </p>
        <div className={cn(
          "opacity-50",
          "group-data-[state=open]:rotate-45"
        )}>
          <Plus className="h-5 w-5" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
          >
            <div className="body-xs space-y-3 p-3 pl-4 pt-0">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
FeatureItem.displayName = "FeatureItem" 
import { Database } from "@/types/supabase"

interface ProductHeaderProps {
  name: string
  price: number
  categories: Database["public"]["Enums"]["product_category"][] | null
}

export function ProductHeader({ name, price, categories }: ProductHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
      <p className="mt-2 text-xl font-semibold text-gray-900">
        {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
      </p>
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span key={index} className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  )
} 
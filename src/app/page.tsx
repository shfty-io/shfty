import Hero from '@/components/root/Hero'
import { ProductList } from '@/components/root/ProductList'

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <ProductList />
    </div>
  )
}

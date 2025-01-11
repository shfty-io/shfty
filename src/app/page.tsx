import Hero from '@/components/root/Hero'
import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col gap-12">
        <Hero />
        <ProductList products={[]} />
      </div>
    </>
  )
}

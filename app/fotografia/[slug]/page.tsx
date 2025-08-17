import { notFound } from "next/navigation"
import { photoCategories } from "@/lib/data"
import CategoryPageClient from "./CategoryPageClient"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return photoCategories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const category = photoCategories.find((cat) => cat.slug === slug)

  if (!category) {
    return {
      title: "Categoría no encontrada - LensByJRR",
    }
  }

  return {
    title: `${category.title} - LensByJRR`,
    description: category.intro,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = photoCategories.find((cat) => cat.slug === slug)

  if (!category) {
    notFound()
  }

  return <CategoryPageClient />
}

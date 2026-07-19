export type CatalogCategory = 'Outerwear' | 'Knitwear' | 'Tops' | 'Bottoms' | 'Accessories'
export type CatalogAvailability = 'available' | 'coming-soon'

export interface ResponsiveImage {
  src: string
  sources: Record<string, string>
  width: number
  height: number
}

export interface CatalogGroup {
  id: string
  title: string
  category: CatalogCategory
  availability: CatalogAvailability
  images: ResponsiveImage[]
  featuredImage?: ResponsiveImage
  badge?: 'Featured' | 'New growth' | 'Growing soon'
}

export interface CategoryMeta {
  id: CatalogCategory
  label: string
  description: string
  representativeGroup: string
  accent: 'marigold' | 'sage' | 'brick' | 'cream' | 'ink'
}

interface PictureImport {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

const pictureModules = import.meta.glob('/resources/shop-items/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?w=480;900;1440&format=avif;webp;jpg&as=picture',
  import: 'default',
}) as Record<string, PictureImport>

const imagesByFolder = Object.entries(pictureModules).reduce<Record<string, ResponsiveImage[]>>((groups, [path, picture]) => {
  const folder = path.split('/').at(-2)
  if (folder) {
    const image: ResponsiveImage = {
      src: picture.img.src,
      sources: picture.sources,
      width: picture.img.w,
      height: picture.img.h,
    }
    ;(groups[folder] ??= []).push(image)
  }
  return groups
}, {})

Object.values(imagesByFolder).forEach((images) => images.sort((a, b) => a.src.localeCompare(b.src)))

const definitions: Array<Omit<CatalogGroup, 'images' | 'featuredImage'> & { folder: string; featuredIndex?: number }> = [
  { id: 'acne-studios-sweater', folder: 'acne_studios_sweater-1750', title: 'Acne Studios Sweater', category: 'Knitwear', availability: 'available', badge: 'New growth' },
  { id: 'adi-cny', folder: 'adi_cny-2899', title: 'Adidas CNY Jacket', category: 'Outerwear', availability: 'available' },
  { id: 'bape-premium', folder: 'bape_premium', title: 'Bape Premium', category: 'Tops', availability: 'available', featuredIndex: 2 },
  { id: 'chrome-hearts-mesh-sleeve', folder: 'chrome_hearts_mesh_sleeve-1750', title: 'Chrome Hearts Mesh Sleeve', category: 'Tops', availability: 'available' },
  { id: 'corteiz-short', folder: 'corteiz_short', title: 'Corteiz Shorts', category: 'Bottoms', availability: 'available' },
  { id: 'essentials-hoodies', folder: 'essen_hoodies-1850', title: 'Essentials Hoodies', category: 'Outerwear', availability: 'available' },
  { id: 'essentials-shorts', folder: 'essen_short-699', title: 'Essentials Shorts', category: 'Bottoms', availability: 'available' },
  { id: 'essentials-tee', folder: 'essen_tee-850', title: 'Essentials Tee', category: 'Tops', availability: 'available' },
  { id: 'goyard', folder: 'goyard', title: 'Goyard Carryalls', category: 'Accessories', availability: 'available', featuredIndex: 3, badge: 'Featured' },
  { id: 'quarter-zip-hoodie', folder: 'hoodie_qzip', title: 'Quarter-Zip Hoodie', category: 'Outerwear', availability: 'available' },
  { id: 'premium-pants', folder: 'premium_pants', title: 'Premium Pants', category: 'Bottoms', availability: 'available' },
  { id: 'stussy-knit', folder: 'stussy_knitted-1900', title: 'Stüssy Knit', category: 'Knitwear', availability: 'available' },
  { id: 'stussy-big-logo-knit', folder: 'stussy_knitted_big_logo-2100', title: 'Stüssy Big Logo Knit', category: 'Knitwear', availability: 'available' },
  { id: 'stussy-mesh-tee', folder: 'stussy_mesh_tee-1300', title: 'Stüssy Mesh Tee', category: 'Tops', availability: 'available', featuredIndex: 2 },
  { id: 'supreme-hoodies', folder: 'supreme_hoodies-2500', title: 'Supreme Hoodies', category: 'Outerwear', availability: 'available', featuredIndex: 2, badge: 'Featured' },
]

export const catalog: CatalogGroup[] = definitions.map(({ folder, featuredIndex = 0, ...group }) => {
  const images = imagesByFolder[folder] ?? []
  return { ...group, images, featuredImage: images[featuredIndex] ?? images[0] }
})

export const categoryMeta: CategoryMeta[] = [
  { id: 'Outerwear', label: 'Outerwear', description: 'Layers built for the changing weather.', representativeGroup: 'supreme-hoodies', accent: 'brick' },
  { id: 'Knitwear', label: 'Knitwear', description: 'Soft structure, bold marks, easy warmth.', representativeGroup: 'stussy-big-logo-knit', accent: 'sage' },
  { id: 'Tops', label: 'Tops', description: 'Graphic staples and breathable statements.', representativeGroup: 'stussy-mesh-tee', accent: 'marigold' },
  { id: 'Bottoms', label: 'Bottoms', description: 'Relaxed foundations for everyday movement.', representativeGroup: 'premium-pants', accent: 'ink' },
  { id: 'Accessories', label: 'Accessories', description: 'The finishing pieces worth carrying.', representativeGroup: 'goyard', accent: 'cream' },
]

export const categories = categoryMeta.map((category) => category.id)
export const totalCatalogImages = catalog.reduce((count, group) => count + group.images.length, 0)
export const availableCatalog = catalog.filter((group) => group.availability === 'available')

export const getCategoryCount = (category: CatalogCategory) => catalog.filter((group) => group.category === category).length
export const getAvailableCategoryCount = (category: CatalogCategory) => availableCatalog.filter((group) => group.category === category).length
export const getGroup = (id: string) => catalog.find((group) => group.id === id)
export const getAltText = (group: CatalogGroup, index: number) => `${group.title}, image study ${index + 1} of ${group.images.length}`

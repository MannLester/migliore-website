import { catalog, categoryMeta, totalCatalogImages } from './catalog'

describe('catalog manifest', () => {
  it('contains every visible style group and all product photos', () => {
    expect(catalog).toHaveLength(15)
    expect(totalCatalogImages).toBe(182)
    expect(new Set(catalog.map((group) => group.id)).size).toBe(15)
    expect(catalog.find((group) => group.id === 'ch-premium')).toBeUndefined()
  })

  it('provides responsive image data for every available collection', () => {
    for (const group of catalog.filter((entry) => entry.availability === 'available')) {
      expect(group.featuredImage).toBeTruthy()
      expect(group.images).toContain(group.featuredImage)
      expect(group.featuredImage?.src).toBeTruthy()
      expect(group.featuredImage?.width).toBeGreaterThan(0)
      expect(group.featuredImage?.height).toBeGreaterThan(0)
      expect(group.featuredImage?.sources).toHaveProperty('avif')
      expect(group.featuredImage?.sources).toHaveProperty('webp')
      expect(group.featuredImage?.sources).toHaveProperty('jpeg')
    }
  })

  it('defines five useful garden beds', () => {
    expect(categoryMeta.map((category) => category.id)).toEqual(['Outerwear', 'Knitwear', 'Tops', 'Bottoms', 'Accessories'])
    expect(categoryMeta.every((category) => category.description && category.representativeGroup)).toBe(true)
  })
})

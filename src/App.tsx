import { useMemo, useRef, useState } from 'react'
import logoUrl from '../resources/branding/image.png'
import {
  catalog,
  categoryMeta,
  getAltText,
  getAvailableCategoryCount,
  getCategoryCount,
  getGroup,
  type CatalogCategory,
  type CatalogGroup,
} from './catalog'
import { socialLinks } from './config'
import { QuickView } from './components/QuickView'
import { ResponsivePicture } from './components/ResponsivePicture'

type Filter = 'All' | CatalogCategory

function BotanicalSprig({ className = '' }: { className?: string }) {
  return (
    <svg className={`botanical-sprig ${className}`} viewBox="0 0 160 100" aria-hidden="true">
      <path d="M8 92C52 74 83 47 147 9" />
      <path d="M42 74C29 59 30 45 35 34C50 42 55 55 42 74Z" />
      <path d="M72 56C63 38 69 24 78 15C89 30 87 44 72 56Z" />
      <path d="M96 40C108 24 123 24 135 28C128 43 114 49 96 40Z" />
      <circle cx="148" cy="9" r="4" />
    </svg>
  )
}

function SocialIcon({ network }: { network: 'instagram' | 'facebook' }) {
  if (network === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle className="social-icon__dot" cx="17.4" cy="6.7" r="1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path className="social-icon__fill" d="M13.8 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V10H7.6v3h2.8v8h3.4Z" />
    </svg>
  )
}

function App() {
  const [filter, setFilter] = useState<Filter>('All')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<CatalogGroup | null>(null)
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)
  const archiveTitleRef = useRef<HTMLHeadingElement>(null)

  const filteredGroups = useMemo(
    () => filter === 'All' ? catalog : catalog.filter((group) => group.category === filter),
    [filter],
  )
  const availableResults = filteredGroups.filter((group) => group.availability === 'available').length

  const openQuickView = (group: CatalogGroup, trigger: HTMLElement) => {
    if (group.availability !== 'available') return
    setReturnFocus(trigger)
    setSelected(group)
  }

  const chooseCategory = (category: CatalogCategory) => {
    setFilter(category)
    archiveTitleRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    archiveTitleRef.current?.focus({ preventScroll: true })
  }

  const heroGroups = ['supreme-hoodies', 'goyard', 'stussy-mesh-tee']
    .map(getGroup)
    .filter((group): group is CatalogGroup => Boolean(group?.featuredImage))

  return (
    <>
      <div id="page-shell" inert={Boolean(selected)} aria-hidden={selected ? 'true' : undefined}>
        <a className="skip-link" href="#main">Skip to main content</a>
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="The Migliore home">
            <img src={logoUrl} alt="" width="48" height="48" />
            <span>The Migliore</span>
          </a>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            <span aria-hidden="true">{menuOpen ? '×' : '↗'}</span>
          </button>
          <nav id="site-navigation" className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'} aria-label="Primary navigation">
            <a href="#garden" onClick={() => setMenuOpen(false)}>The garden</a>
            <a href="#archive" onClick={() => setMenuOpen(false)}>Archive</a>
            <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          </nav>
          <span className="header-note">Independent since 2022</span>
        </header>

        <main id="main">
          <section className="hero" id="top" aria-labelledby="hero-title">
            <BotanicalSprig className="hero__sprig" />
            <div className="hero__copy">
              <p className="eyebrow"><span aria-hidden="true">✿</span> The apparel garden · Est. 2022</p>
              <h1 id="hero-title">Streetwear,<br /><em>grown slowly.</em></h1>
              <p className="hero__intro">An independent edit of cult pieces, everyday uniforms, and the details that deserve a closer look.</p>
              <a className="primary-link" href="#garden">Explore the garden <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-editorial" role="group" aria-label="Three featured apparel studies">
              {heroGroups.map((group, index) => (
                <figure className={`hero-study hero-study--${index + 1}`} key={group.id}>
                  <ResponsivePicture
                    image={group.featuredImage!}
                    alt={group.title}
                    sizes={index === 0 ? '(max-width: 700px) 72vw, 38vw' : '(max-width: 700px) 42vw, 20vw'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{group.title}</figcaption>
                </figure>
              ))}
              <div className="hero-seal" aria-hidden="true"><span>✿</span> Curated in small batches</div>
            </div>
          </section>

          <section className="garden section-shell" id="garden" aria-labelledby="garden-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Choose a garden bed</p>
                <h2 id="garden-title">Where do you<br />want to wander?</h2>
              </div>
              <p>Each bed gathers pieces by the way they live in a wardrobe. Choose one to narrow the archive, or keep wandering through everything.</p>
            </div>
            <div className="garden-grid">
              {categoryMeta.map((category, index) => {
                const representative = getGroup(category.representativeGroup)
                return (
                  <button
                    className={`garden-bed garden-bed--${index + 1} garden-bed--${category.accent}`}
                    type="button"
                    key={category.id}
                    onClick={() => chooseCategory(category.id)}
                    aria-label={`Explore ${category.label}, ${getCategoryCount(category.id)} collections`}
                  >
                    {representative?.featuredImage && (
                      <ResponsivePicture
                        image={representative.featuredImage}
                        alt=""
                        sizes="(max-width: 700px) 92vw, (max-width: 1050px) 46vw, 30vw"
                        loading="lazy"
                      />
                    )}
                    <span className="garden-bed__wash" aria-hidden="true" />
                    <span className="seed-label">
                      <span className="seed-label__number">Bed {String(index + 1).padStart(2, '0')}</span>
                      <strong>{category.label}</strong>
                      <span>{category.description}</span>
                      <span className="seed-label__count">
                        {getCategoryCount(category.id)} collections
                        {getAvailableCategoryCount(category.id) !== getCategoryCount(category.id) && ' · 1 growing'}
                      </span>
                    </span>
                    <span className="garden-bed__arrow" aria-hidden="true">↘</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="archive section-shell" id="archive" aria-labelledby="archive-title">
            <BotanicalSprig className="archive__sprig" />
            <div className="section-heading archive-heading">
              <div>
                <p className="eyebrow">The complete planting index</p>
                <h2 id="archive-title" ref={archiveTitleRef} tabIndex={-1}>The archive.</h2>
              </div>
              <p className="result-count" aria-live="polite">
                {filter === 'All' ? 'All beds' : filter} · {availableResults} available
                {filteredGroups.length > availableResults && ` · ${filteredGroups.length - availableResults} growing`}
              </p>
            </div>
            <div className="filters" aria-label="Filter archive">
              {(['All', ...categoryMeta.map((entry) => entry.id)] as Filter[]).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={filter === category ? 'filter-button filter-button--active' : 'filter-button'}
                  onClick={() => setFilter(category)}
                  aria-pressed={filter === category}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="catalog-grid">
              {filteredGroups.map((group, index) => (
                <article className={`catalog-card ${group.availability === 'coming-soon' ? 'catalog-card--seed' : ''}`} key={group.id} style={{ '--delay': `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}>
                  {group.availability === 'available' && group.featuredImage ? (
                    <button type="button" className="catalog-card__action" onClick={(event) => openQuickView(group, event.currentTarget)} aria-label={`Open ${group.title} image study`}>
                      <span className="card-image">
                        <ResponsivePicture image={group.featuredImage} alt={getAltText(group, group.images.indexOf(group.featuredImage))} sizes="(max-width: 440px) 92vw, (max-width: 960px) 46vw, 30vw" loading="lazy" />
                        {group.images[1] && group.images[1] !== group.featuredImage && (
                          <ResponsivePicture image={group.images[1]} className="card-image__alternate" alt="" sizes="(max-width: 440px) 92vw, (max-width: 960px) 46vw, 30vw" loading="lazy" />
                        )}
                        {group.badge && <span className="badge">{group.badge}</span>}
                        <span className="study-link">Open study <span aria-hidden="true">↗</span></span>
                      </span>
                      <span className="card-meta">
                        <span><small>{group.category}</small><strong>{group.title}</strong></span>
                        <small>{group.images.length}-image study</small>
                      </span>
                    </button>
                  ) : (
                    <div className="seed-card" aria-label={`${group.title}, growing soon`}>
                      <BotanicalSprig />
                      <img src={logoUrl} alt="" width="180" height="180" />
                      <span className="badge">Growing soon</span>
                      <div><small>{group.category}</small><h3>{group.title}</h3><p>A new study is taking root. Imagery will appear here when it is ready.</p></div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="story section-shell" id="story" aria-labelledby="story-title">
            <div className="story__mark">
              <span className="orbit-copy" aria-hidden="true">THE MIGLIORE · CULTIVATED SLOWLY · EST. 2022 · </span>
              <img src={logoUrl} alt="The Migliore, established 2022" width="960" height="960" />
            </div>
            <div className="story__copy">
              <p className="eyebrow">A note from our corner</p>
              <h2 id="story-title">An archive with<br />room to grow.</h2>
              <p>Established in 2022, The Migliore brings street icons, daily uniforms, and unexpected details into one warm, unrushed archive—made for looking closer, following references, and enjoying clothes one image study at a time.</p>
              <BotanicalSprig />
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div><p className="footer-mark">The Migliore</p><p>Botanical warmth.<br />Street-level energy.</p></div>
          <nav aria-label="Footer navigation"><a href="#garden">Garden</a><a href="#archive">Archive</a><a href="#story">Story</a></nav>
          <div className="social-cta">
            <p>Follow the garden</p>
            <nav className="social-links" aria-label="Follow The Migliore">
              <a className="social-link" href={socialLinks.instagram} target="_blank" rel="noreferrer noopener" aria-label="Follow The Migliore on Instagram" title="Instagram">
                <SocialIcon network="instagram" />
              </a>
              <a className="social-link" href={socialLinks.facebook} target="_blank" rel="noreferrer noopener" aria-label="Follow The Migliore on Facebook" title="Facebook">
                <SocialIcon network="facebook" />
              </a>
            </nav>
          </div>
          <p>© {new Date().getFullYear()} The Migliore<br />Independent since 2022.</p>
        </footer>
      </div>

      {selected && <QuickView group={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />}
    </>
  )
}

export default App

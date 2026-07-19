import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CatalogGroup } from '../catalog'
import { getAltText } from '../catalog'
import { ResponsivePicture } from './ResponsivePicture'

interface QuickViewProps {
  group: CatalogGroup
  onClose: () => void
  returnFocus: HTMLElement | null
}

const focusableSelector = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export function QuickView({ group, onClose, returnFocus }: QuickViewProps) {
  const [index, setIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const images = group.images

  const previous = () => setIndex((current) => Math.max(0, current - 1))
  const next = () => setIndex((current) => Math.min(images.length - 1, current + 1))

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    document.body.classList.add('modal-open')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
      if (event.key !== 'Tab' || !dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
      returnFocus?.focus()
    }
  }, [onClose, returnFocus])

  useEffect(() => {
    if (index >= images.length - 1) return
    const preload = new Image()
    preload.src = images[index + 1].src
  }, [images, index])

  if (!images.length) return null

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="quick-view" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <div className="quick-view__topbar">
          <div>
            <p className="eyebrow">Image study · {group.category}</p>
            <h2 id="quick-view-title">{group.title}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close image study" onClick={onClose} data-autofocus>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div
          className="quick-view__stage"
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return
            const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current
            if (distance > 48) previous()
            if (distance < -48) next()
            touchStart.current = null
          }}
        >
          <img
            className="gallery-image"
            src={images[index].src}
            width={images[index].width}
            height={images[index].height}
            alt={getAltText(group, index)}
          />
          <p className="image-count" aria-live="polite">Study {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</p>
          <button className="gallery-control gallery-control--prev" type="button" onClick={previous} disabled={index === 0} aria-label="Previous image">←</button>
          <button className="gallery-control gallery-control--next" type="button" onClick={next} disabled={index === images.length - 1} aria-label="Next image">→</button>
        </div>
        <div className="quick-view__footer">
          <p>Use arrow keys or swipe to move through the study.</p>
          <div className="thumbnails" aria-label={`${group.title} image thumbnails`}>
            {images.map((image, imageIndex) => (
              <button
                type="button"
                key={image.src}
                className={imageIndex === index ? 'thumbnail thumbnail--active' : 'thumbnail'}
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show image ${imageIndex + 1}`}
                aria-current={imageIndex === index ? 'true' : undefined}
              >
                <ResponsivePicture image={image} alt="" sizes="72px" loading={imageIndex < 4 ? 'eager' : 'lazy'} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App'

describe('editorial garden showcase', () => {
  it('uses a garden bed to filter the archive and move focus', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Explore Knitwear, 3 collections/i }))
    expect(screen.getByText('Knitwear · 3 available')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The archive.' })).toHaveFocus()
    const archive = screen.getByRole('region', { name: 'The archive.' })
    expect(within(archive).getByText('Acne Studios Sweater')).toBeInTheDocument()
    expect(within(archive).queryByText('Goyard Carryalls')).not.toBeInTheDocument()
  })

  it('filters directly without rendering the removed coming-soon item', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Accessories' }))
    expect(screen.getByText('Accessories · 1 available')).toBeInTheDocument()
    expect(screen.queryByText('Chrome Hearts Premium')).not.toBeInTheDocument()
  })

  it('opens an image study, navigates boundaries, and restores focus on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trigger = screen.getByRole('button', { name: 'Open Acne Studios Sweater image study' })

    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Acne Studios Sweater' })
    const previous = within(dialog).getByRole('button', { name: 'Previous image' })
    const next = within(dialog).getByRole('button', { name: 'Next image' })
    expect(previous).toBeDisabled()
    expect(within(dialog).getByText('Study 01 / 06')).toBeInTheDocument()
    expect(document.getElementById('page-shell')).toHaveAttribute('inert')

    await user.click(next)
    expect(within(dialog).getByText('Study 02 / 06')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(within(dialog).getByText('Study 01 / 06')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('traps focus and supports swipe navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open Acne Studios Sweater image study' }))
    const dialog = screen.getByRole('dialog', { name: 'Acne Studios Sweater' })
    const close = within(dialog).getByRole('button', { name: 'Close image study' })
    expect(close).toHaveFocus()

    const stage = within(dialog).getByText('Study 01 / 06').parentElement!
    fireEvent.touchStart(stage, { touches: [{ clientX: 240 }] })
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 120 }] })
    expect(within(dialog).getByText('Study 02 / 06')).toBeInTheDocument()

    close.focus()
    await user.tab({ shift: true })
    expect(within(dialog).getByRole('button', { name: 'Show image 6' })).toHaveFocus()
  })

  it('renders responsive picture sources with dimensions and loading hints', () => {
    const { container } = render(<App />)
    const picture = container.querySelector('.hero-study picture')
    expect(picture?.querySelector('source[type="image/avif"]')).toHaveAttribute('srcset')
    expect(picture?.querySelector('source[type="image/webp"]')).toHaveAttribute('sizes')
    const image = picture?.querySelector('img')
    expect(image).toHaveAttribute('width')
    expect(image).toHaveAttribute('height')
    expect(image).toHaveAttribute('fetchpriority', 'high')
  })

  it('offers accessible navigation and contains no commerce controls or prices', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const menu = screen.getByRole('button', { name: /menu/i })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await user.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.queryByText(/checkout|add to cart|order now/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/\$\s*\d|NT\$|price/i)).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Follow The Migliore on Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/the_miglioree?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    )
    expect(screen.getByRole('link', { name: 'Follow The Migliore on Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/Migliorecollections',
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})

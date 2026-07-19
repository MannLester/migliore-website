import type { ImgHTMLAttributes } from 'react'
import type { ResponsiveImage } from '../catalog'

interface ResponsivePictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  image: ResponsiveImage
}

export function ResponsivePicture({ image, alt, sizes, ...props }: ResponsivePictureProps) {
  return (
    <picture>
      {Object.entries(image.sources).map(([format, srcSet]) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        {...props}
        src={image.src}
        width={image.width}
        height={image.height}
        sizes={sizes}
        alt={alt}
      />
    </picture>
  )
}

import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KD-Peppermints',
    short_name: 'KD-Pep',
    description: 'Small doses, real care.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7FAF8',
    theme_color: '#3FBFA0',
    icons: [
      {
        src: '/kdpep1.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/kdpep1.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],
  modules: ['@nuxtjs/seo', '@nuxt/image'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'AutoSales',
      titleTemplate: '%s · AutoSales',
      meta: [
        { name: 'description', content: 'Compra y venta de autos, reserva de pruebas y gestión de ventas.' },
        { property: 'og:site_name', content: 'AutoSales' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    name: 'AutoSales',
    description: 'Compra y venta de autos, reserva de pruebas y gestión de ventas.',
    defaultLocale: 'es',
    indexable: true,
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001',
      siteName: 'AutoSales',
      siteDescription: 'Compra y venta de autos, reserva de pruebas y gestión de ventas.',
      siteDefaultLocale: 'es',
    },
  },
  sitemap: {
    exclude: ['/login', '/register', '/vehiculos', '/ventas', '/perfil', '/mis-citas', '/api/**'],
  },
  robots: {
    disallow: ['/login', '/register', '/vehiculos', '/ventas', '/perfil', '/mis-citas', '/api'],
  },
  image: {
    domains: ['images.unsplash.com', 'localhost', 'localhost:3000', '127.0.0.1:3000'],
    quality: 75,
  },
  devServer: {
    port: 3001,
  },
})

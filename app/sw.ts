// ============================================================
// FlowDay – Service Worker (Serwist v9)
// Caching strategies per resource type
// ============================================================
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
}

declare global {
  interface ServiceWorkerGlobalConfig extends SerwistGlobalConfig {}
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // ── Supabase API — NetworkFirst (3s timeout) ──────────
    // Fresh data preferred, fallback to cache when offline
    {
      matcher: ({ url }: { url: URL }) =>
        url.hostname.includes('supabase.co') ||
        url.pathname.startsWith('/rest/v1/') ||
        url.pathname.startsWith('/auth/'),
      handler: new NetworkFirst({
        cacheName: 'supabase-api-cache',
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },

    // ── Google Fonts CSS — StaleWhileRevalidate ───────────
    {
      matcher: ({ url }: { url: URL }) =>
        url.hostname === 'fonts.googleapis.com',
      handler: new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
      }),
    },

    // ── Google Fonts files — CacheFirst ───────────────────
    {
      matcher: ({ url }: { url: URL }) =>
        url.hostname === 'fonts.gstatic.com',
      handler: new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },

    // ── Static images — CacheFirst (30 days) ─────────────
    {
      matcher: ({ request }: { request: Request }) =>
        request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
          new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },

    // Include Next.js default caching rules
    ...defaultCache,
  ],
})

serwist.addEventListeners()

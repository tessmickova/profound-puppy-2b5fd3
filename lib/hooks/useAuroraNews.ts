'use client'
// lib/hooks/useAuroraNews.ts — SWR hook pro zprávy o aurora z médií (15min refresh)
import useSWR from 'swr'

interface NewsItem {
  id: string
  title: string
  snippet: string
  source: string
  sourceUrl: string
  author: string | null
  publishedAt: string
  translated: boolean
  originalLang: string | null
  category: 'media_cz' | 'media_int' | 'official' | 'social' | 'swpc' | 'expert_cz' | 'expert_eu' | 'expert'
  forecastQuote: string | null
}

interface AuroraNewsResponse {
  date: string
  items: NewsItem[]
  sources: string[]
  lastChecked: string
  note: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useAuroraNews() {
  const { data, error, isLoading, mutate } = useSWR<AuroraNewsResponse>(
    '/api/aurora-news',
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000, // 15 minut
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
      errorRetryCount: 2,
      keepPreviousData: true,
    }
  )

  return {
    news: data?.items ?? [],
    date: data?.date ?? null,
    sources: data?.sources ?? [],
    lastChecked: data?.lastChecked ?? null,
    note: data?.note ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}

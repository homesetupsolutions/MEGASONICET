import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

export function hoursUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function getReminderStatus(eventDate: string): '50h' | '26h' | 'same-day' | 'none' {
  const h = hoursUntil(eventDate)
  if (h <= 0) return 'none'
  if (h <= 24) return 'same-day'
  if (h <= 26) return '26h'
  if (h <= 50) return '50h'
  return 'none'
}

export function calcJobTotal(hours: number, rate: number, extras: number = 0): number {
  return hours * rate + extras
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

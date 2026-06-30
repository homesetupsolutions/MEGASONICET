// ============================================================
// MEGASONICET - utils.ts
// Shared utility functions across all modules
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type BusinessKey = 'FEELBASSVIP' | 'HSS'

export const BUSINESS_NAMES: Record<BusinessKey, string> = {
  FEELBASSVIP: 'FeelBassVIP',
  HSS: 'Home Setup Solutions'
}

export const BUSINESS_COLORS: Record<BusinessKey, string> = {
  FEELBASSVIP: '#7c3aed',
  HSS: '#0ea5e9'
}

// ---- Currency ----
export function formatCAD(cents: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100)
}

export function centsFromDollars(dollars: number): number {
  return Math.round(dollars * 100)
}

// ---- Date/Time ----
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateTime(iso: string): string {
  return `${formatDateShort(iso)} at ${formatTime(iso)}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDateShort(iso)
}

// ---- Phone ----
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}

export function cleanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return raw
}

// ---- Duration ----
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// ---- Status Badges ----
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export type CallStatus = 'answered' | 'missed' | 'voicemail' | 'busy'

export function bookingStatusColor(status: BookingStatus): string {
  return { pending: 'yellow', confirmed: 'green', cancelled: 'red' }[status] || 'gray'
}

export function leadStatusColor(status: LeadStatus): string {
  return { new: 'blue', contacted: 'yellow', quoted: 'purple', won: 'green', lost: 'red' }[status] || 'gray'
}

export function callStatusColor(status: CallStatus): string {
  return { answered: 'green', missed: 'red', voicemail: 'yellow', busy: 'orange' }[status] || 'gray'
}

// ---- Validation ----
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)]{10,}$/.test(phone)
}

// ---- API helpers ----
export function apiError(message: string, status = 500) {
  return Response.json({ success: false, error: message }, { status })
}

export function apiSuccess(data: unknown, status = 200) {
  return Response.json({ success: true, ...( typeof data === 'object' && data !== null ? data : { data }) }, { status })
}

// ---- Truncate ----
export function truncate(str: string, max = 50): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

// ---- Calgary timezone ----
export const TZ = 'America/Edmonton'

export function nowCalgary(): Date {
  return new Date(new Date().toLocaleString('en-CA', { timeZone: TZ }))
}

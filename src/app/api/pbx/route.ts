import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PBX Call Log API - stores/retrieves call records from Supabase
// The actual WebRTC signaling is handled client-side via src/lib/pbx.ts (MegaSonicPBX class)
// This route handles call log persistence and extension config

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const extension = searchParams.get('extension')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabaseAdmin
    .from('call_logs')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(limit)

  if (extension) query = query.eq('extension', extension)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { extension, direction, remote_number, remote_name, start_time, end_time, duration, status, notes } = body

  const { data, error } = await supabaseAdmin.from('call_logs').insert({
    extension: extension || '17778140621100',
    direction,
    remote_number,
    remote_name,
    start_time,
    end_time,
    duration,
    status,
    notes
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// GET /api/pbx/extensions - return extension map for Callcentric account 17778140621
export const CALLCENTRIC_EXTENSIONS = [
  { ext: '100', full: '17778140621100', label: 'CALL NEW',           did: '18332302933' },
  { ext: '101', full: '17778140621101', label: 'HSS Customer Service', did: '18332302933' },
  { ext: '102', full: '17778140621102', label: 'Calgary Office',      did: '18332302933' },
  { ext: '103', full: '17778140621103', label: 'HSS Field Tech',      did: '18332302933' },
  { ext: '104', full: '17778140621104', label: 'FEELBASSVIP SYSTEM',  did: '18447664226' },
  { ext: '105', full: '17778140621105', label: 'FEELBASSVIP CONF',    did: '18447664226' },
  { ext: '106', full: '17778140621106', label: 'AI Line',             did: '18332302933' },
  { ext: '107', full: '17778140621107', label: 'FEELBASSVIP Mobile',  did: '18447664226' },
]

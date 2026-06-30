import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

// Callcentric SIP Account Info
// Account: 17778140621
// Extensions:
//   100 - Main
//   101 - HSS Customer Service
//   102 - Calgary Office
//   103 - HSS Field Tech
//   104 - FEELBASSVIP SYSTEM
//   105 - FEELBASSVIP CONF
//   106 - AI
//   107 - FEELBASSVIP Mobile

const CALLCENTRIC_ACCOUNT = process.env.CALLCENTRIC_ACCOUNT || '17778140621';
const CALLCENTRIC_SIP_HOST = process.env.CALLCENTRIC_SIP_HOST || 'callcentric.com';

export interface Extension {
  ext: string;
  sipUser: string;
  label: string;
  business: string;
}

const EXTENSIONS: Extension[] = [
  { ext: '100', sipUser: `${CALLCENTRIC_ACCOUNT}`,      label: 'Main',                business: 'HSS' },
  { ext: '101', sipUser: `${CALLCENTRIC_ACCOUNT}101`,   label: 'HSS Customer Service', business: 'HSS' },
  { ext: '102', sipUser: `${CALLCENTRIC_ACCOUNT}102`,   label: 'Calgary Office',       business: 'HSS' },
  { ext: '103', sipUser: `${CALLCENTRIC_ACCOUNT}103`,   label: 'HSS Field Tech',       business: 'HSS' },
  { ext: '104', sipUser: `${CALLCENTRIC_ACCOUNT}104`,   label: 'FEELBASSVIP SYSTEM',   business: 'FeelBassVIP' },
  { ext: '105', sipUser: `${CALLCENTRIC_ACCOUNT}105`,   label: 'FEELBASSVIP CONF',     business: 'FeelBassVIP' },
  { ext: '106', sipUser: `${CALLCENTRIC_ACCOUNT}106`,   label: 'AI',                   business: 'AI' },
  { ext: '107', sipUser: `${CALLCENTRIC_ACCOUNT}107`,   label: 'FEELBASSVIP Mobile',   business: 'FeelBassVIP' },
];

// GET /api/callcentric - list extensions and SIP config
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ext = searchParams.get('ext');

  if (ext) {
    const found = EXTENSIONS.find(e => e.ext === ext);
    if (!found) {
      return NextResponse.json({ error: 'Extension not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...found,
      sipHost: CALLCENTRIC_SIP_HOST,
      wsUrl: `wss://${CALLCENTRIC_SIP_HOST}`,
      stunServer: 'stun:stun.l.google.com:19302',
    });
  }

  return NextResponse.json({
    account: CALLCENTRIC_ACCOUNT,
    sipHost: CALLCENTRIC_SIP_HOST,
    wsUrl: `wss://${CALLCENTRIC_SIP_HOST}`,
    stunServer: 'stun:stun.l.google.com:19302',
    extensions: EXTENSIONS,
  });
}

// POST /api/callcentric - initiate or log a call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, fromExt, toNumber, notes } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    if (action === 'dial') {
      if (!fromExt || !toNumber) {
        return NextResponse.json({ error: 'fromExt and toNumber are required for dial' }, { status: 400 });
      }
      const extension = EXTENSIONS.find(e => e.ext === fromExt);
      if (!extension) {
        return NextResponse.json({ error: 'Invalid extension' }, { status: 400 });
      }
      // Return SIP dial info - actual SIP signaling handled client-side via WebRTC
      return NextResponse.json({
        success: true,
        action: 'dial',
        from: extension,
        to: toNumber,
        sipUri: `sip:${toNumber}@${CALLCENTRIC_SIP_HOST}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'log') {
      // Log call record (would persist to Supabase in production)
      return NextResponse.json({
        success: true,
        action: 'log',
        logged: { fromExt, toNumber, notes, timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Callcentric API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

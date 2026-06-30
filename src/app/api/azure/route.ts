import { NextRequest, NextResponse } from 'next/server';
import { azureChat, azureSpeechToken, azureUploadBlob, azureListBlobs, azureDemoMode } from '@/lib/azure';

export const dynamic = 'force-dynamic'

// GET /api/azure?action=status|speech-token|list-files
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action') || 'status';

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          demo: azureDemoMode,
          services: {
            openai: azureDemoMode.openai ? 'demo' : 'live',
            speech: azureDemoMode.speech ? 'demo' : 'live',
            storage: azureDemoMode.storage ? 'demo' : 'live',
          },
        });

      case 'speech-token': {
        const result = await azureSpeechToken();
        return NextResponse.json(result);
      }

      case 'list-files': {
        const blobs = await azureListBlobs();
        return NextResponse.json({ files: blobs });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Azure error', detail: String(err) }, { status: 500 });
  }
}

// POST /api/azure  body: { action, ...payload }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action } = body;

  try {
    switch (action) {
      // ---- CHAT (Monica AI via Azure OpenAI) ----
      case 'chat': {
        const messages = body.messages as { role: 'system' | 'user' | 'assistant'; content: string }[];
        const systemPrompt = (body.systemPrompt as string) || undefined;
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: 'messages array required' }, { status: 400 });
        }
        const result = await azureChat(messages, systemPrompt);
        return NextResponse.json(result);
      }

      // ---- UPLOAD FILE to Blob Storage ----
      case 'upload-file': {
        const blobName    = body.blobName    as string;
        const fileData    = body.data        as string;  // base64 or plain text
        const contentType = (body.contentType as string) || 'application/octet-stream';
        const isBase64    = (body.base64     as boolean) || false;

        if (!blobName || !fileData) {
          return NextResponse.json({ error: 'blobName and data required' }, { status: 400 });
        }

        const buffer = isBase64
          ? Buffer.from(fileData, 'base64')
          : Buffer.from(fileData, 'utf8');

        const result = await azureUploadBlob(blobName, buffer, contentType);
        return NextResponse.json(result);
      }

      // ---- GENERATE INVOICE TEXT and upload ----
      case 'generate-invoice': {
        const { clientName, amount, items, bookingId } = body as {
          clientName: string;
          amount: number;
          items: string[];
          bookingId: string;
        };

        const invoiceText = [
          '=== MEGASONIC / FEELBASS VIP INVOICE ===',
          `Date: ${new Date().toLocaleDateString('en-CA')}`,
          `Booking ID: ${bookingId}`,
          `Client: ${clientName}`,
          '',
          'ITEMS:',
          ...(items || []).map((item, i) => `  ${i + 1}. ${item}`),
          '',
          `TOTAL: $${Number(amount).toFixed(2)} CAD`,
          '',
          'Thank you for choosing FeelBass VIP!',
          'vip@feelbass.vip | +1-777-814-0621',
        ].join('\n');

        const blobName = `invoices/INV-${bookingId}-${Date.now()}.txt`;
        const result = await azureUploadBlob(blobName, invoiceText, 'text/plain');
        return NextResponse.json({ ...result, invoiceText });
      }

      // ---- ASK MONICA (convenience wrapper) ----
      case 'ask-monica': {
        const userMessage = body.message as string;
        const history = (body.history as { role: 'user' | 'assistant'; content: string }[]) || [];
        if (!userMessage) {
          return NextResponse.json({ error: 'message required' }, { status: 400 });
        }
        const messages = [
          ...history,
          { role: 'user' as const, content: userMessage },
        ];
        const result = await azureChat(messages);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Azure API error', detail: String(err) }, { status: 500 });
  }
}

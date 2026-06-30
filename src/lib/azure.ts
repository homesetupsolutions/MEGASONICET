// MegaSonic Azure Integration
// Covers: Azure OpenAI, Azure Speech Services, Azure Blob Storage
// Falls back to DEMO MODE when keys are missing

const AZURE_OPENAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT   || '';
const AZURE_OPENAI_KEY        = process.env.AZURE_OPENAI_KEY        || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const AZURE_OPENAI_API_VER    = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

const AZURE_SPEECH_KEY        = process.env.AZURE_SPEECH_KEY        || '';
const AZURE_SPEECH_REGION     = process.env.AZURE_SPEECH_REGION     || 'canadacentral';

const AZURE_STORAGE_ACCOUNT   = process.env.AZURE_STORAGE_ACCOUNT   || '';
const AZURE_STORAGE_KEY       = process.env.AZURE_STORAGE_KEY       || '';
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'megasonic';

const DEMO_OPENAI   = !AZURE_OPENAI_ENDPOINT  || !AZURE_OPENAI_KEY;
const DEMO_SPEECH   = !AZURE_SPEECH_KEY;
const DEMO_STORAGE  = !AZURE_STORAGE_ACCOUNT  || !AZURE_STORAGE_KEY;

// ─────────────────────────────────────────────
// AZURE OPENAI  (chat completions)
// ─────────────────────────────────────────────
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  content: string;
  demo: boolean;
  tokens?: number;
}

const MONICA_SYSTEM = `You are Monica, the AI business assistant for MegaSonic Command Center (FeelBass VIP / HomeSetupSolutions). 
You help manage bookings, leads, payments, reminders and operations. 
Always be concise, professional, and business-focused. 
You know the business runs wearable bass sensory experiences (BassSkin headbands) for events in Canada. 
Default currency is CAD. Calendar is vip@feelbass.vip. PBX number is +1-777-814-0621.`;

export async function azureChat(
  messages: ChatMessage[],
  systemPrompt: string = MONICA_SYSTEM
): Promise<ChatResult> {
  if (DEMO_OPENAI) {
    const last = messages[messages.length - 1]?.content || '';
    return {
      demo: true,
      content: generateDemoReply(last),
    };
  }

  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VER}`;

  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 800,
    temperature: 0.7,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    demo: false,
    content: data.choices?.[0]?.message?.content || 'No response.',
    tokens: data.usage?.total_tokens,
  };
}

function generateDemoReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('book')) return 'Demo: I can see your bookings. To create a new booking, go to /bookings and fill in the client details. Reminder windows (50h/26h/same-day) will auto-trigger via Twilio SMS.';
  if (lower.includes('pay') || lower.includes('invoice')) return 'Demo: Payments are processed through Square. Current demo shows $485.00 CAD in completed transactions. Go to /payments to view or create invoices.';
  if (lower.includes('lead')) return 'Demo: You have 3 hot leads and 2 warm leads. Head to /leads to follow up. Use the Hunt For Money panel on the dashboard to call directly.';
  if (lower.includes('remind')) return 'Demo: Reminder system is armed. 50h, 26h, and same-day SMS reminders fire automatically via Twilio when booking dates approach.';
  if (lower.includes('call') || lower.includes('phone') || lower.includes('pbx')) return 'Demo: PBX softphone is active on /pbx. Extensions 100-107 on Callcentric account +1-777-814-0621. WebRTC dialer ready.';
  if (lower.includes('calendar')) return 'Demo: Google Calendar synced to vip@feelbass.vip. New bookings auto-create events. Visit /calendar to view and manage.';
  return 'Demo Mode active — Azure OpenAI key not configured. Add AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY to .env to enable live AI responses.';
}

// ─────────────────────────────────────────────
// AZURE SPEECH SERVICES  (TTS token)
// ─────────────────────────────────────────────
export interface SpeechTokenResult {
  token: string;
  region: string;
  demo: boolean;
}

export async function azureSpeechToken(): Promise<SpeechTokenResult> {
  if (DEMO_SPEECH) {
    return { token: 'demo-speech-token', region: AZURE_SPEECH_REGION, demo: true };
  }

  const url = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY },
  });

  if (!res.ok) throw new Error(`Speech token error: ${res.status}`);
  const token = await res.text();
  return { token, region: AZURE_SPEECH_REGION, demo: false };
}

// ─────────────────────────────────────────────
// AZURE BLOB STORAGE  (file uploads)
// ─────────────────────────────────────────────
export interface BlobUploadResult {
  url: string;
  blobName: string;
  demo: boolean;
}

export async function azureUploadBlob(
  blobName: string,
  data: Buffer | string,
  contentType = 'application/octet-stream'
): Promise<BlobUploadResult> {
  if (DEMO_STORAGE) {
    return {
      url: `https://demo.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}`,
      blobName,
      demo: true,
    };
  }

  const body = typeof data === 'string' ? Buffer.from(data) : data;
  const date = new Date().toUTCString();
  const contentLength = body.length;

  // Build Shared Key auth header
  const stringToSign = [
    'PUT',
    '',
    contentType,
    '',
    `x-ms-blob-type:BlockBlob`,
    `x-ms-date:${date}`,
    `x-ms-version:2020-08-04`,
    `/${AZURE_STORAGE_ACCOUNT}/${AZURE_STORAGE_CONTAINER}/${blobName}`,
  ].join('\n');

  const { createHmac } = await import('crypto');
  const sig = createHmac('sha256', Buffer.from(AZURE_STORAGE_KEY, 'base64'))
    .update(stringToSign, 'utf8')
    .digest('base64');

  const authHeader = `SharedKey ${AZURE_STORAGE_ACCOUNT}:${sig}`;
  const url = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: authHeader,
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-date': date,
      'x-ms-version': '2020-08-04',
      'Content-Type': contentType,
      'Content-Length': String(contentLength),
    },
    body,
  });

  if (!res.ok) throw new Error(`Blob upload error: ${res.status}`);
  return { url, blobName, demo: false };
}

export async function azureListBlobs(): Promise<{ name: string; url: string; demo: boolean }[]> {
  if (DEMO_STORAGE) {
    return [
      { name: 'demo-contract.pdf', url: 'https://demo.blob.core.windows.net/megasonic/demo-contract.pdf', demo: true },
      { name: 'demo-invoice.pdf', url: 'https://demo.blob.core.windows.net/megasonic/demo-invoice.pdf', demo: true },
    ];
  }

  const date = new Date().toUTCString();
  const url = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}?restype=container&comp=list`;

  const stringToSign = [
    'GET', '', '', '', '',
    `x-ms-date:${date}`,
    `x-ms-version:2020-08-04`,
    `/${AZURE_STORAGE_ACCOUNT}/${AZURE_STORAGE_CONTAINER}\ncomp:list\nrestype:container`,
  ].join('\n');

  const { createHmac } = await import('crypto');
  const sig = createHmac('sha256', Buffer.from(AZURE_STORAGE_KEY, 'base64'))
    .update(stringToSign, 'utf8')
    .digest('base64');

  const res = await fetch(url, {
    headers: {
      Authorization: `SharedKey ${AZURE_STORAGE_ACCOUNT}:${sig}`,
      'x-ms-date': date,
      'x-ms-version': '2020-08-04',
    },
  });

  if (!res.ok) throw new Error(`List blobs error: ${res.status}`);
  const xml = await res.text();
  const matches = [...xml.matchAll(/<Name>([^<]+)<\/Name>/g)];
  return matches.map(m => ({
    name: m[1],
    url: `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${m[1]}`,
    demo: false,
  }));
}

export const azureDemoMode = {
  openai: DEMO_OPENAI,
  speech: DEMO_SPEECH,
  storage: DEMO_STORAGE,
};

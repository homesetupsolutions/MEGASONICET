import { NextRequest, NextResponse } from 'next/server';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || '';
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || '';
const DEMO_MODE = !SQUARE_ACCESS_TOKEN || SQUARE_ACCESS_TOKEN === 'your_square_access_token_here';

const SQUARE_BASE = 'https://connect.squareup.com/v2';

async function squareFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SQUARE_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-17',
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// GET /api/square?action=payments|catalog|customers|invoices
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action') || 'payments';

  if (DEMO_MODE) {
    const demoData: Record<string, unknown> = {
      payments: {
        payments: [
          { id: 'demo_pay_001', amount_money: { amount: 15000, currency: 'CAD' }, status: 'COMPLETED', created_at: new Date().toISOString(), note: 'FeelBass Demo Booking #1' },
          { id: 'demo_pay_002', amount_money: { amount: 25000, currency: 'CAD' }, status: 'COMPLETED', created_at: new Date(Date.now() - 86400000).toISOString(), note: 'VIP Package Demo' },
          { id: 'demo_pay_003', amount_money: { amount: 8500, currency: 'CAD' }, status: 'PENDING', created_at: new Date(Date.now() - 172800000).toISOString(), note: 'Deposit Demo' },
        ]
      },
      catalog: {
        objects: [
          { id: 'demo_item_001', type: 'ITEM', item_data: { name: 'FeelBass VIP Experience', variations: [{ id: 'v1', item_variation_data: { name: 'Standard', price_money: { amount: 15000, currency: 'CAD' } } }] } },
          { id: 'demo_item_002', type: 'ITEM', item_data: { name: 'BassSkin Rental - 4hr', variations: [{ id: 'v2', item_variation_data: { name: 'Standard', price_money: { amount: 8500, currency: 'CAD' } } }] } },
        ]
      },
      customers: {
        customers: [
          { id: 'demo_cust_001', given_name: 'Alex', family_name: 'Demo', email_address: 'alex@demo.com', phone_number: '+14165550001' },
          { id: 'demo_cust_002', given_name: 'Jordan', family_name: 'Test', email_address: 'jordan@demo.com', phone_number: '+14165550002' },
        ]
      },
      invoices: {
        invoices: [
          { id: 'demo_inv_001', status: 'PAID', payment_requests: [{ computed_amount_money: { amount: 15000, currency: 'CAD' } }], created_at: new Date().toISOString() },
        ]
      },
    };
    return NextResponse.json({ demo: true, ...(demoData[action] || {}) });
  }

  try {
    let data;
    switch (action) {
      case 'payments':
        data = await squareFetch(`/payments?location_id=${SQUARE_LOCATION_ID}&limit=50`);
        break;
      case 'catalog':
        data = await squareFetch('/catalog/list?types=ITEM');
        break;
      case 'customers':
        data = await squareFetch('/customers?limit=50');
        break;
      case 'invoices':
        data = await squareFetch(`/invoices?location_id=${SQUARE_LOCATION_ID}&limit=50`);
        break;
      default:
        data = { error: 'Unknown action' };
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Square API error', detail: String(err) }, { status: 500 });
  }
}

// POST /api/square  body: { action, ...payload }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, ...payload } = body;

  if (DEMO_MODE) {
    return NextResponse.json({
      demo: true,
      success: true,
      message: `Demo: ${action} executed`,
      id: `demo_${Date.now()}`,
    });
  }

  try {
    let data;
    switch (action) {
      case 'create_payment': {
        // payload: { amount, currency, sourceId, note, customerId }
        const idempotencyKey = `megasonic_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        data = await squareFetch('/payments', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: idempotencyKey,
            source_id: payload.sourceId || 'EXTERNAL',
            amount_money: { amount: payload.amount, currency: payload.currency || 'CAD' },
            location_id: SQUARE_LOCATION_ID,
            note: payload.note || 'MegaSonic Booking',
            customer_id: payload.customerId,
          }),
        });
        break;
      }
      case 'create_customer': {
        const idempotencyKey2 = `cust_${Date.now()}`;
        data = await squareFetch('/customers', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: idempotencyKey2,
            given_name: payload.firstName,
            family_name: payload.lastName,
            email_address: payload.email,
            phone_number: payload.phone,
          }),
        });
        break;
      }
      case 'create_invoice': {
        const idempotencyKey3 = `inv_${Date.now()}`;
        // First create order, then invoice
        const order = await squareFetch('/orders', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: `order_${Date.now()}`,
            order: {
              location_id: SQUARE_LOCATION_ID,
              line_items: [{
                name: payload.itemName || 'FeelBass Service',
                quantity: '1',
                base_price_money: { amount: payload.amount, currency: 'CAD' },
              }],
              customer_id: payload.customerId,
            },
          }),
        });
        data = await squareFetch('/invoices', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: idempotencyKey3,
            invoice: {
              location_id: SQUARE_LOCATION_ID,
              order_id: order?.order?.id,
              primary_recipient: { customer_id: payload.customerId },
              payment_requests: [{
                request_type: 'BALANCE',
                due_date: payload.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              }],
              delivery_method: 'EMAIL',
              invoice_number: `MST-${Date.now()}`,
              title: payload.title || 'FeelBass VIP Invoice',
            },
          }),
        });
        break;
      }
      case 'refund_payment': {
        data = await squareFetch('/refunds', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: `refund_${Date.now()}`,
            payment_id: payload.paymentId,
            amount_money: { amount: payload.amount, currency: 'CAD' },
            reason: payload.reason || 'Customer cancellation',
          }),
        });
        break;
      }
      default:
        data = { error: 'Unknown action' };
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Square API error', detail: String(err) }, { status: 500 });
  }
}

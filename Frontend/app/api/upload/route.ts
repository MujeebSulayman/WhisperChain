import { NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT ?? '';
// Attachments are capped at 50 MB by the contract; encryption adds 16 bytes.
const MAX_UPLOAD_BYTES = 50_000_000 + 1024;
const URL_LIFETIME_S = 60;
const LIMIT_PER_IP_PER_MINUTE = Number(process.env.UPLOAD_LIMIT_PER_IP_MINUTE ?? '20');

// Per-instance memory, like the relayer's limits: a speed bump, not a guarantee.
const hits = new Map<string, number[]>();

function allow(key: string): boolean {
	const now = Date.now();
	const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
	if (recent.length >= LIMIT_PER_IP_PER_MINUTE) return false;
	recent.push(now);
	hits.set(key, recent);
	if (hits.size > 10_000) {
		for (const [k, ts] of hits) if (ts.every((t) => now - t >= 60_000)) hits.delete(k);
	}
	return true;
}

/*
 * Hands the browser a one-minute Pinata upload URL, so it can upload directly (no request-size
 * limits here) without ever seeing the Pinata credentials.
 */
export async function POST(req: Request) {
	if (!PINATA_JWT) {
		return NextResponse.json({ error: 'Uploads not configured (PINATA_JWT)' }, { status: 503 });
	}
	const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
	if (!allow(ip)) {
		return NextResponse.json({ error: 'Too many uploads. Wait a moment and try again.' }, { status: 429 });
	}

	const response = await fetch('https://uploads.pinata.cloud/v3/files/sign', {
		method: 'POST',
		headers: { Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			network: 'public',
			date: Math.floor(Date.now() / 1000),
			expires: URL_LIFETIME_S,
			max_file_size: MAX_UPLOAD_BYTES,
		}),
	});
	if (!response.ok) {
		return NextResponse.json({ error: 'Could not create an upload link' }, { status: 502 });
	}
	const { data } = await response.json();
	return NextResponse.json({ url: data });
}

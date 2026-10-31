'use client';

import { decryptFile, encryptFile, type FileKey } from './e2e';

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export const MEDIA_TYPE = {
	TEXT: 0,
	IMAGE: 1,
	VIDEO: 2,
	AUDIO: 3,
	DOCUMENT: 4,
} as const;

export type MediaTypeName = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export function getMediaTypeFromFile(file: File): number {
	const t = file.type.toLowerCase();
	if (t.startsWith('image/')) return MEDIA_TYPE.IMAGE;
	if (t.startsWith('video/')) return MEDIA_TYPE.VIDEO;
	if (t.startsWith('audio/')) return MEDIA_TYPE.AUDIO;
	return MEDIA_TYPE.DOCUMENT;
}

export function getMediaTypeName(type: number): MediaTypeName {
	const names: MediaTypeName[] = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'];
	return names[type] ?? 'TEXT';
}

/*
 * Uploads go straight from the browser to Pinata through a short-lived signed URL from
 * /api/upload, so the Pinata credentials stay on the server.
 */
export async function uploadToIPFS(file: File | Blob, filename?: string): Promise<string> {
	try {
		const signed = await fetch('/api/upload', { method: 'POST' });
		const { url, error } = await signed.json().catch(() => ({}));
		if (!signed.ok || !url) throw new Error(error || 'Could not get an upload link');

		const formData = new FormData();
		formData.append('file', file, filename ?? 'file');
		formData.append('network', 'public');
		const response = await fetch(url, { method: 'POST', body: formData });
		if (!response.ok) throw new Error('Pinata upload failed');
		const { data } = await response.json();
		if (!data?.cid) throw new Error('Pinata returned no CID');
		return data.cid;
	} catch (error: any) {
		throw new Error(`IPFS upload failed: ${error.message}`);
	}
}

/** Encrypts `file` and uploads the ciphertext. The returned key opens it again (see downloadDecryptedFile). */
export async function uploadEncryptedFile(file: File): Promise<{ cid: string; file: FileKey }> {
	const { key, data } = encryptFile(new Uint8Array(await file.arrayBuffer()));
	// A generic name and type: the real ones travel encrypted inside the message.
	const cid = await uploadToIPFS(new Blob([data as BlobPart], { type: 'application/octet-stream' }), 'scarf.bin');
	return { cid, file: { k: key, n: file.name, m: file.type || 'application/octet-stream' } };
}

/** Downloads and decrypts an attachment, as a Blob with its original type. */
export async function downloadDecryptedFile(hash: string, file: FileKey): Promise<Blob> {
	const encrypted = new Uint8Array(await (await downloadFromIPFS(hash)).arrayBuffer());
	return new Blob([decryptFile(encrypted, file.k) as BlobPart], { type: file.m });
}

export function getIPFSUrl(hash: string): string {
	if (!hash || typeof hash !== 'string') return '';
	const trimmed = hash.trim();
	if (trimmed.startsWith('ipfs://')) {
		hash = trimmed.replace('ipfs://', '');
	} else {
		hash = trimmed;
	}
	const cleanHash = hash.startsWith('/') ? hash.slice(1) : hash;
	if (!cleanHash) return '';
	const cleanGateway = IPFS_GATEWAY.endsWith('/')
		? IPFS_GATEWAY
		: `${IPFS_GATEWAY}/`;
	return `${cleanGateway}${cleanHash}`;
}

export async function downloadFromIPFS(hash: string): Promise<Blob> {
	const url = getIPFSUrl(hash);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Failed to download from IPFS');
	}
	return response.blob();
}

export async function downloadTextFromIPFS(hash: string): Promise<string> {
	const blob = await downloadFromIPFS(hash);
	return blob.text();
}

'use client';

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

// Contract enum: 0=TEXT, 1=IMAGE, 2=VIDEO, 3=AUDIO, 4=DOCUMENT
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

export async function uploadToIPFS(
	file: File | Blob,
	filename?: string,
	checkUsed?: (hash: string) => Promise<boolean>
): Promise<string> {
	if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
		throw new Error(
			'Pinata API keys are required. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in your .env.local file.'
		);
	}

	try {
		const hash = await uploadToPinata(file, filename);

		if (checkUsed) {
			const isUsed = await checkUsed(hash);
			if (isUsed) {
				throw new Error('This file has already been uploaded to the network');
			}
		}

		return hash;
	} catch (error: any) {
		throw new Error(`IPFS upload failed: ${error.message}`);
	}
}

async function uploadToPinata(
	file: File | Blob,
	filename?: string
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file, filename);

	const response = await fetch(
		'https://api.pinata.cloud/pinning/pinFileToIPFS',
		{
			method: 'POST',
			headers: {
				pinata_api_key: PINATA_API_KEY!,
				pinata_secret_api_key: PINATA_SECRET_KEY!,
			},
			body: formData,
		}
	);

	if (!response.ok) {
		throw new Error('Pinata upload failed');
	}

	const data = await response.json();
	return data.IpfsHash;
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

export async function uploadTextToIPFS(text: string): Promise<string> {
	const blob = new Blob([text], { type: 'text/plain' });
	return uploadToIPFS(blob, 'message.txt');
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

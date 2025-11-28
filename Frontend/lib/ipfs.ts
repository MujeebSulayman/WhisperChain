'use client';

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

export type MediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export function getMediaTypeFromFile(file: File): number {
	const type = file.type.toLowerCase();
	if (type.startsWith('image/')) return 1; // IMAGE
	if (type.startsWith('video/')) return 2; // VIDEO
	if (type.startsWith('audio/')) return 3; // AUDIO
	return 4; // DOCUMENT
}

export function getMediaTypeName(type: number): MediaType {
	switch (type) {
		case 0:
			return 'TEXT';
		case 1:
			return 'IMAGE';
		case 2:
			return 'VIDEO';
		case 3:
			return 'AUDIO';
		case 4:
			return 'DOCUMENT';
		default:
			return 'TEXT';
	}
}

export async function uploadToIPFS(
	file: File | Blob,
	filename?: string
): Promise<string> {
	try {
		if (PINATA_API_KEY && PINATA_SECRET_KEY) {
			return await uploadToPinata(file, filename);
		}
		return await uploadToPublicGateway(file, filename);
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

async function uploadToPublicGateway(
	file: File | Blob,
	filename?: string
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file, filename);

	const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new Error('IPFS upload failed');
	}

	const data = await response.json();
	return data.Hash;
}

export function getIPFSUrl(hash: string): string {
	if (hash.startsWith('ipfs://')) {
		hash = hash.replace('ipfs://', '');
	}
	return `${IPFS_GATEWAY}${hash}`;
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

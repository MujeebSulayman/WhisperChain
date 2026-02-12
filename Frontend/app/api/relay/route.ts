import { NextResponse } from 'next/server';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import paymasterAbi from '@/blockchain/WhisperChainPaymaster.json';
import forwarderAbi from '@/blockchain/Forwarder.json';
import type { InterfaceAbi } from 'ethers';

const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? '';
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? '';
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC ?? '';
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY ?? '';
const REIMBURSEMENT_WEI = BigInt(process.env.RELAYER_REIMBURSEMENT_WEI ?? '50000000000000');

type RelayBody = {
	request: {
		from: string;
		to: string;
		value: string;
		gas: string;
		nonce: string;
		data: string;
	};
	signature: string;
};

export async function POST(req: Request) {
	if (!RELAYER_PRIVATE_KEY) {
		return NextResponse.json(
			{ error: 'Relayer not configured (RELAYER_PRIVATE_KEY)' },
			{ status: 503 }
		);
	}
	if (!FORWARDER_ADDRESS) {
		return NextResponse.json(
			{ error: 'Forwarder not configured' },
			{ status: 503 }
		);
	}

	let body: RelayBody;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { request, signature } = body;
	if (!request?.from || !request?.to || request?.data === undefined || !signature) {
		return NextResponse.json({ error: 'Missing request or signature' }, { status: 400 });
	}

	const value = BigInt(request.value ?? '0');
	let gas: bigint;
	if (request.gas && request.gas !== '0') {
		gas = BigInt(request.gas);
	} else {
		const provider = new JsonRpcProvider(RPC_URL);
		const estimated = await provider.estimateGas({
			from: request.from,
			to: request.to,
			data: request.data,
			value,
		});
		gas = estimated + BigInt(80_000);
	}
	const nonce = BigInt(request.nonce ?? '0');
	const reqTuple = [
		request.from,
		request.to,
		value,
		gas,
		nonce,
		request.data,
	] as const;

	const provider = new JsonRpcProvider(RPC_URL);
	const wallet = new Wallet(RELAYER_PRIVATE_KEY, provider);
	const relayerAddress = await wallet.getAddress();

	try {
		if (PAYMASTER_ADDRESS) {
			const paymaster = new Contract(
				PAYMASTER_ADDRESS,
				paymasterAbi as InterfaceAbi,
				wallet
			);
			const tx = await paymaster.relay(
				reqTuple,
				signature,
				relayerAddress,
				REIMBURSEMENT_WEI,
				{ value }
			);
			const receipt = await tx.wait();
			return NextResponse.json({ hash: receipt?.hash ?? tx.hash });
		}

		const forwarder = new Contract(
			FORWARDER_ADDRESS,
			forwarderAbi as InterfaceAbi,
			wallet
		);
		const tx = await forwarder.execute(reqTuple, signature, { value });
		const receipt = await tx.wait();
		return NextResponse.json({ hash: receipt?.hash ?? tx.hash });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Relay failed';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

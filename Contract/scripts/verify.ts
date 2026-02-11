import * as fs from 'fs';
import * as path from 'path';
import hre from 'hardhat';
import { run } from 'hardhat';

const MODULE_ID = 'WhisperChainModule';

function getDeployedAddressesPath(): string {
	const chainId = (hre.network.config as { chainId?: number }).chainId;
	if (chainId == null) {
		throw new Error('Network chainId not set in hardhat config');
	}
	return path.join(
		__dirname,
		'..',
		'ignition',
		'deployments',
		`chain-${chainId}`,
		'deployed_addresses.json'
	);
}

function loadDeployedAddresses(): Record<string, string> {
	const filePath = getDeployedAddressesPath();
	if (!fs.existsSync(filePath)) {
		throw new Error(
			`Deployment file not found: ${filePath}. Run: npx hardhat ignition deploy ./ignition/modules/WhisperChain.ts --network ${hre.network.name}`
		);
	}
	const raw = fs.readFileSync(filePath, 'utf-8');
	return JSON.parse(raw) as Record<string, string>;
}

async function verifyContract(
	address: string,
	constructorArguments: unknown[] = [],
	contract?: string
): Promise<void> {
	await run('verify:verify', {
		address,
		constructorArguments,
		...(contract ? { contract } : {}),
	});
}

async function main() {
	const addresses = loadDeployedAddresses();

	const forwarder = addresses[`${MODULE_ID}#Forwarder`];
	const whisperChain = addresses[`${MODULE_ID}#WhisperChain`];
	const paymaster = addresses[`${MODULE_ID}#WhisperChainPaymaster`];

	if (!forwarder || !whisperChain || !paymaster) {
		throw new Error(
			`Missing addresses in deployment file. Got: ${JSON.stringify(addresses)}. Ensure you deployed with the current WhisperChain Ignition module.`
		);
	}

	console.log('Deployed addresses:', { forwarder, whisperChain, paymaster });

	console.log('Verifying Forwarder...');
	try {
		await verifyContract(
			forwarder,
			[],
			'contracts/Forwarder.sol:Forwarder'
		);
		console.log('Forwarder verified.');
	} catch (e: unknown) {
		console.log('Forwarder verify:', e instanceof Error ? e.message : e);
	}

	console.log('Verifying WhisperChain...');
	try {
		await verifyContract(whisperChain, [forwarder]);
		console.log('WhisperChain verified.');
	} catch (e: unknown) {
		console.log('WhisperChain verify:', e instanceof Error ? e.message : e);
	}

	console.log('Verifying WhisperChainPaymaster...');
	try {
		await verifyContract(paymaster, [forwarder]);
		console.log('WhisperChainPaymaster verified.');
	} catch (e: unknown) {
		console.log('WhisperChainPaymaster verify:', e instanceof Error ? e.message : e);
	}

	console.log('Done.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

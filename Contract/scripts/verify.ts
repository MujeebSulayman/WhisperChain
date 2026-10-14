import * as fs from 'fs';
import * as path from 'path';
import hre from 'hardhat';
import { run } from 'hardhat';

const MODULE_ID = 'ScarfModule';

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
		// Use DEPLOYMENT_ID when you deployed with --deployment-id.
		process.env.DEPLOYMENT_ID ?? `chain-${chainId}`,
		'deployed_addresses.json'
	);
}

function loadDeployedAddresses(): Record<string, string> {
	const filePath = getDeployedAddressesPath();
	if (!fs.existsSync(filePath)) {
		throw new Error(
			`Deployment file not found: ${filePath}. Run: npx hardhat ignition deploy ./ignition/modules/Scarf.ts --network ${hre.network.name}`
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

	const forwarder = addresses[`${MODULE_ID}#ScarfForwarder`];
	const scarf = addresses[`${MODULE_ID}#Scarf`];
	const paymaster = addresses[`${MODULE_ID}#ScarfPaymaster`];

	if (!forwarder || !scarf || !paymaster) {
		throw new Error(
			`Missing addresses in deployment file. Got: ${JSON.stringify(addresses)}. Ensure you deployed with the current Scarf Ignition module.`
		);
	}

	console.log('Deployed addresses:', { forwarder, scarf, paymaster });

	console.log('Verifying Forwarder...');
	try {
		await verifyContract(
			forwarder,
			[],
			'contracts/ScarfForwarder.sol:ScarfForwarder'
		);
		console.log('Forwarder verified.');
	} catch (e: unknown) {
		console.log('Forwarder verify:', e instanceof Error ? e.message : e);
	}

	console.log('Verifying Scarf...');
	try {
		await verifyContract(scarf, [forwarder]);
		console.log('Scarf verified.');
	} catch (e: unknown) {
		console.log('Scarf verify:', e instanceof Error ? e.message : e);
	}

	console.log('Verifying ScarfPaymaster...');
	try {
		await verifyContract(paymaster, [forwarder, scarf]);
		console.log('ScarfPaymaster verified.');
	} catch (e: unknown) {
		console.log('ScarfPaymaster verify:', e instanceof Error ? e.message : e);
	}

	console.log('Done.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

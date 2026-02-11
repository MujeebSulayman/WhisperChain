export const REQUEST_CANCELLED_MESSAGE = 'Request cancelled';

export function isUserRejectedError(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	const err = error as { code?: number | string; message?: string; reason?: string };
	const code = err.code;
	const msg = String(err.message ?? err.reason ?? '').toLowerCase();
	if (code === 4001 || code === 'ACTION_REJECTED') return true;
	if (msg.includes('user rejected') || msg.includes('rejected the request') || msg.includes('denied') || msg.includes('user denied')) return true;
	return false;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
	if (isUserRejectedError(error)) return REQUEST_CANCELLED_MESSAGE;
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
		return (error as { message: string }).message;
	}
	return fallback;
}

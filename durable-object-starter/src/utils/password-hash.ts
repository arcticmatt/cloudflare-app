export async function hashPassword(password: string): Promise<string> {
	// Convert password string to bytes
	const encoder = new TextEncoder();
	const data = encoder.encode(password);

	// Generate salt
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// Hash the password with salt
	const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array([...salt, ...data]));

	// Convert hash to base64 string
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	// Return combined salt + hash
	return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, hashHex] = storedHash.split(':');

	// Convert stored salt from hex to bytes
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

	// Hash the input password with stored salt
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array([...salt, ...data]));

	// Convert to hex for comparison
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const inputHashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

	return inputHashHex === hashHex;
}

/**
 * Core E2EE Utility Service
 * Uses Web Crypto API for secure browser-based encryption.
 */

// Algorithms for RSA Key Generation
const ALGO = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
};

/**
 * Generates a new RSA Key Pair for E2EE
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
        ALGO,
        true, // Extractable (needed to export public key)
        ["encrypt", "decrypt"]
    );
}

/**
 * Exports a Public Key to Base64 string for storage on API
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Imports a Public Key from Base64 string
 */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
    const binaryDerString = atob(pem);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        ALGO,
        true,
        ["encrypt"]
    );
}

/**
 * Encrypts data using a public key
 */
export async function encryptMessage(text: string, publicKey: CryptoKey): Promise<string> {
    const encoded = new TextEncoder().encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

/**
 * Decrypts data using a private key
 */
export async function decryptMessage(encryptedBase64: string, privateKey: CryptoKey): Promise<string> {
    const encrypted = new Uint8Array(
        atob(encryptedBase64).split("").map((c) => c.charCodeAt(0))
    );
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}

/**
 * Key Storage Helpers (using IndexedDB for security)
 */
const DB_NAME = 'fapem_crypto';
const STORE_NAME = 'keys';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function storePrivateKey(key: CryptoKey): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(key, 'private_key');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function getPrivateKey(): Promise<CryptoKey | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get('private_key');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

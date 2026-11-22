// Cloud storage sync helpers (Google Drive / OneDrive)
// Configure via env (Vite): VITE_GOOGLE_CLIENT_ID, VITE_MS_CLIENT_ID

export type CloudProvider = 'google' | 'onedrive';

const BACKUP_FILENAME = 'vectra-backup.json';

function getGoogleClientId() {
    return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
}
function getMsClientId() {
    return (import.meta as any).env?.VITE_MS_CLIENT_ID || '';
}

export function isGoogleConfigured() {
    return !!getGoogleClientId();
}
export function isOneDriveConfigured() {
    return !!getMsClientId();
}

// ---------- Google Drive ----------
let googleToken: string | null = localStorage.getItem('vectra_google_token');

export async function connectGoogle(): Promise<string> {
    const clientId = getGoogleClientId();
    if (!clientId) throw new Error('Google client ID not configured');
    return new Promise((resolve, reject) => {
        const load = () => {
            const g = (window as any).google;
            if (!g?.accounts?.oauth2) return reject(new Error('Google Identity Services not loaded'));
            const client = g.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (resp: any) => {
                    if (resp.error) return reject(new Error(resp.error));
                    googleToken = resp.access_token;
                    localStorage.setItem('vectra_google_token', googleToken!);
                    resolve(googleToken!);
                }
            });
            client.requestAccessToken();
        };
        if ((window as any).google?.accounts?.oauth2) load();
        else {
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true;
            s.onload = load;
            s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
            document.head.appendChild(s);
        }
    });
}

export function disconnectGoogle() {
    googleToken = null;
    localStorage.removeItem('vectra_google_token');
}

export async function uploadToGoogle(data: any): Promise<void> {
    if (!googleToken) throw new Error('Not connected to Google Drive');
    // find existing file
    const search = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and trashed=false&spaces=drive`, {
        headers: { Authorization: `Bearer ${googleToken}` }
    });
    const searchJson = await search.json();
    const existing = searchJson.files?.[0];
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({ name: BACKUP_FILENAME, mimeType: 'application/json' })], { type: 'application/json' }));
    form.append('file', blob);
    const url = existing
        ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const method = existing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${googleToken}` }, body: form });
    if (!res.ok) throw new Error('Google Drive upload failed');
}

export async function downloadFromGoogle(): Promise<any> {
    if (!googleToken) throw new Error('Not connected to Google Drive');
    const search = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and trashed=false&spaces=drive`, {
        headers: { Authorization: `Bearer ${googleToken}` }
    });
    const searchJson = await search.json();
    const existing = searchJson.files?.[0];
    if (!existing) throw new Error('No backup found in Google Drive');
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`, {
        headers: { Authorization: `Bearer ${googleToken}` }
    });
    if (!res.ok) throw new Error('Google Drive download failed');
    return res.json();
}

// ---------- OneDrive ----------
let msToken: string | null = localStorage.getItem('vectra_ms_token');
let msalInstance: any = null;

async function loadMsal() {
    if ((window as any).msal) return (window as any).msal;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js';
        s.async = true;
        s.onload = () => resolve((window as any).msal);
        s.onerror = () => reject(new Error('Failed to load MSAL'));
        document.head.appendChild(s);
    });
}

export async function connectOneDrive(): Promise<string> {
    const clientId = getMsClientId();
    if (!clientId) throw new Error('Microsoft client ID not configured');
    const msal = await loadMsal();
    if (!msalInstance) {
        msalInstance = new msal.PublicClientApplication({
            auth: { clientId, redirectUri: window.location.origin }
        });
        await msalInstance.initialize();
    }
    const resp = await msalInstance.loginPopup({ scopes: ['Files.ReadWrite'] });
    msToken = resp.accessToken;
    localStorage.setItem('vectra_ms_token', msToken!);
    return msToken!;
}

export function disconnectOneDrive() {
    msToken = null;
    localStorage.removeItem('vectra_ms_token');
}

export async function uploadToOneDrive(data: any): Promise<void> {
    if (!msToken) throw new Error('Not connected to OneDrive');
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${BACKUP_FILENAME}:/content`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${msToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('OneDrive upload failed');
}

export async function downloadFromOneDrive(): Promise<any> {
    if (!msToken) throw new Error('Not connected to OneDrive');
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${BACKUP_FILENAME}:/content`, {
        headers: { Authorization: `Bearer ${msToken}` }
    });
    if (!res.ok) throw new Error('OneDrive download failed (no backup?)');
    return res.json();
}
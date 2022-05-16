// Import modules
import fetch, { FormData } from 'node-fetch';

// Import files
import { splits } from './Splits.js';

export const upload = async () => {
    const probe = await fetch(`https://splits.io/api/v4/runs`, {
        method: "POST"
    });
    const response = await probe.json();

    if (response.status !== 201) {
        return 'Upload failed.';
    }

    const body = new FormData();
    for (const key in response.presigned_request.fields) {
        body.append(key, response.presigned_request.fields[key]);
    }
    body.append('file', splits);
    await fetch(response.presigned_request.uri, {
        method: "POST",
        body: body
    });

    return `Upload complete. Claim your splits: ${response.uris.claim_url}`;
}
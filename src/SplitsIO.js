// Import modules
import * as fs from 'fs';
import fetch from 'node-fetch';
import { FormData } from "formdata-node"

// Import files
import { config } from '../index.js';
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
        body.set(key, response.presigned_request.fields[key]);
    }
    body.set('file', fs.readFileSync(`${config.splitsPath}/${splits.fileName}.json`));

    const post = await fetch(response.presigned_request.uri, {
        method: response.presigned_request.method,
        body: body
    });

    return `Upload complete. Claim your splits: ${response.uris.claim_uri}`;
}
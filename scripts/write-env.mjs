import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let apiUrl = (process.env.API_URL || 'http://127.0.0.1:8000/api').trim().replace(/\/$/, '');
if (!apiUrl.endsWith('/api')) {
  apiUrl = `${apiUrl}/api`;
}

writeFileSync(
  join(root, 'src', 'environments', 'environment.ts'),
  `export const environment = {\n  apiUrl: ${JSON.stringify(apiUrl)},\n};\n`,
);

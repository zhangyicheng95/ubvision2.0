import { URL } from 'url';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 5173;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../', htmlFileName)}`;
  };
}

const md5sum = (content: string) => {
  const md5 = crypto.createHash('md5');
  return md5.update(content).digest('hex');
}

export { resolveHtmlPath, md5sum }

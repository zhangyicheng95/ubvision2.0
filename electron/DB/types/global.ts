import path from 'path';

import { app } from 'electron';


const isDevMode = process.env.NODE_ENV !== 'production';

const userPath = isDevMode ? path.join(process.cwd(), '.dev_cache') : app.getPath('userData');

export {isDevMode, userPath};

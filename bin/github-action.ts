import authenticate from '../src/index.js';
import {run} from '../src/github-action.js';

await run(authenticate);

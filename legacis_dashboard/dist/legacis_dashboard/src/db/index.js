import { Database, Resource } from '@adminjs/prisma';
import { db } from '../../../src/lib/db.js';
import AdminJS from 'adminjs';
AdminJS.registerAdapter({ Database, Resource });
const initialize = async () => ({ db });
export default initialize;

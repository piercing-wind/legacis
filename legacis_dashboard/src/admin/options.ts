import { AdminJSOptions } from 'adminjs';
import componentLoader from './component-loader.js';

const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/admin',
  resources: [
      {
         resource: { model: 'User', client: 'prisma' },
         options: {
         properties: {
            password: {
               isVisible: { list: false, filter: false, show: false, edit: true },
            },
         },
         },
      },
      {
         resource: { model: 'Serivce', client: 'prisma' },
         options: {
         properties: {
            content: {
               isVisible: { list: true, filter: true, show: true, edit: true },
            },
         },
         },
      },
  ],
  databases: [],
};

export default options;

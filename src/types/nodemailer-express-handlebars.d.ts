declare module 'nodemailer-express-handlebars' {
  import { Transporter } from 'nodemailer';
  import { Options as ExpressHandlebarsOptions } from 'express-handlebars';

  interface NodemailerExpressHandlebarsOptions {
    viewEngine?: any;
    viewPath?: string;
    extName?: string;
    [key: string]: any;
  }

  function hbs(options?: NodemailerExpressHandlebarsOptions): (mail: any, callback: (err?: Error) => void) => void;
  export = hbs;
}
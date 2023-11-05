import * as BTFG from '../const.mjs';

export function registerHandlebarsHelper() {
  Handlebars.registerHelper('template', function (path) {
    return `modules/${BTFG.MODULE_ID}/templates/${path}`;
  });
}

import * as BTFG from '../const.mjs';

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 */
export const registerTemplates = function () {
  loadTemplates([
    `modules/${BTFG.MODULE_ID}/templates/_choose.html.hbs`,
    `modules/${BTFG.MODULE_ID}/templates/_export.html.hbs`,
    `modules/${BTFG.MODULE_ID}/templates/_default-mapping.html.hbs`,
  ]);
};

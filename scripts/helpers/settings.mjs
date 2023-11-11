import * as BTFG from '../const.mjs';

export function registerSettings() {
  game.settings.register(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING, {
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });
}

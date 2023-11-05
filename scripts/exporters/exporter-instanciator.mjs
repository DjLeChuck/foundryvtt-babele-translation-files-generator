import { ItemExporter } from './item-exporter.mjs';

const EXPORTERS = {
  Item: ItemExporter,
};

export class ExporterInstanciator {
  /**
   * @param {CompendiumCollection} pack
   * @param {*} options
   * @returns {AbstractExporter}
   */
  static createForPack(pack, options) {
    try {
      return new EXPORTERS[pack.metadata.type](pack, options);
    } catch (err) {
      console.error(`[BTFG] Exporter creation error: ${err.toString()}`);

      ui.notifications.error(game.i18n.format('BTFG.ExporterInstanciator.InvalidCompendium', {
        name: pack.metadata.name,
      }));
    }
  }
}

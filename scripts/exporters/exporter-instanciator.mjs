import { ItemExporter } from './item-exporter.mjs';
import { CardsExporter } from './cards-exporter.mjs';

const EXPORTERS = {
  Item: ItemExporter,
  Cards: CardsExporter,
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
        label: pack.metadata.label,
      }));
    }
  }
}

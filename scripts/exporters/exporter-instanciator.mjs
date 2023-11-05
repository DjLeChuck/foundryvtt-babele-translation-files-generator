import { ActorExporter } from './actor-exporter.mjs';
import { AdventureExporter } from './adventure-exporter.mjs';
import { CardsExporter } from './cards-exporter.mjs';
import { ItemExporter } from './item-exporter.mjs';

const EXPORTERS = {
  Actor: ActorExporter,
  Adventure: AdventureExporter,
  Cards: CardsExporter,
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
        label: pack.metadata.label,
      }));
    }
  }
}

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
      console.error(err);
      ui.notifications.error(`Can not create exporter for the compendium ${pack.metadata.name}`);
    }
  }
}

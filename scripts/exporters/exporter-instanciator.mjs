import * as exporters from './_index.mjs';

const EXPORTERS = {
  Actor: exporters.ActorExporter,
  Adventure: exporters.AdventureExporter,
  Cards: exporters.CardsExporter,
  Item: exporters.ItemExporter,
  JournalEntry: exporters.JournalEntryExporter,
  Macro: exporters.MacroExporter,
  Playlist: exporters.PlaylistExporter,
  RollTable: exporters.RollTableExporter,
  Scene: exporters.SceneExporter,
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

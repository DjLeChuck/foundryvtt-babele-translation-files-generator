import * as exporters from './_index.mjs';

/** @type {Record<string, typeof AbstractExporter>} */
const EXPORTER_CLASSES = {
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

export class ExporterManager {
  /** @type {CompendiumCollection} */
  #pack;

  /** @type {ExporterOptions} */
  #options;

  /** @type {File|null} */
  #existingFile;

  /** @type {Record<string, AbstractExporter>} */
  #instances = {};

  /**
   * @param {CompendiumCollection} pack
   * @param {ExporterOptions} options
   * @param {File|null} existingFile
   */
  constructor(pack, options, existingFile) {
    this.#pack = pack;
    this.#options = options;
    this.#existingFile = existingFile;
  }

  /** @returns {CompendiumCollection} */
  get pack() {
    return this.#pack;
  }

  /** @returns {ExporterOptions} */
  get options() {
    return this.#options;
  }

  /** @returns {File|null} */
  get existingFile() {
    return this.#existingFile;
  }

  /**
   * Returns the exporter instance for the given type, creating it if needed.
   *
   * @param {string} type
   * @returns {AbstractExporter}
   */
  getExporter(type) {
    if (!this.#instances[type]) {
      const ExporterClass = EXPORTER_CLASSES[type];

      if (!ExporterClass) {
        throw new Error(`[BTFG] No exporter found for type "${type}"`);
      }

      this.#instances[type] = new ExporterClass(this);
    }

    return this.#instances[type];
  }

  /**
   * Runs the export for the pack's document type.
   */
  async export() {
    try {
      await this.getExporter(this.#pack.metadata.type).export();
    } catch (err) {
      console.error('[BTFG] Exporter creation error');
      console.error(err);

      ui.notifications.error(game.i18n.format('BTFG.ExporterManager.InvalidCompendium', {
        label: this.#pack.metadata.label,
      }));
    }
  }
}

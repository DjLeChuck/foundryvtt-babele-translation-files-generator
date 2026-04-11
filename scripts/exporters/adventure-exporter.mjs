import { AbstractExporter } from './abstract-exporter.mjs';

export class AdventureExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {AdventureData} document
   */
  async getDocumentData(indexDocument, document) {
    // Not used in this exporter
    return {};
  }

  _getIndexFields() {
    return ['caption', 'scenes', 'macros', 'playlists', 'actors', 'items', 'tables', 'folders', 'journal', 'cards'];
  }

  async _processDataset() {
    const avPackIndex = await this.pack.getIndex({ fields: this._getIndexFields() });

    avPackIndex.contents.forEach((avPack) => {
      this.progressTotalElements += avPack.scenes.length + avPack.macros.length + avPack.playlists.length
        + avPack.actors.length + avPack.items.length + avPack.tables.length + avPack.folders.length
        + avPack.journal.length + avPack.cards.length;
    });

    for (const avPack of avPackIndex.contents) {
      let exporter;
      this.dataset.entries[avPack.name] = {
        name: avPack.name,
        description: avPack.description,
        caption: avPack.caption,
        scenes: {},
        macros: {},
        playlists: {},
        actors: {},
        items: {},
        tables: {},
        folders: {},
        journals: {},
        cards: {},
      };

      // Scenes
      exporter = this.getExporter('Scene');
      for (const document of avPack.scenes) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].scenes[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.scenes ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Macros
      exporter = this.getExporter('Macro');
      for (const document of avPack.macros) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].macros[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.macros ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Playlists
      exporter = this.getExporter('Playlist');
      for (const document of avPack.playlists) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].playlists[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.playlists ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Actors
      exporter = this.getExporter('Actor');
      for (const document of avPack.actors) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].actors[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.actors ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Items
      exporter = this.getExporter('Item');
      for (const document of avPack.items) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].items[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.items ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Tables
      exporter = this.getExporter('RollTable');
      for (const document of avPack.tables) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].tables[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.tables ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Folders
      for (const { name } of avPack.folders) {
        this.dataset.entries[avPack.name].folders[name] = (this.existingContent[avPack.name]?.folders ?? {})[name] ?? name;

        this._stepProgressBar();
      }

      // Journals
      exporter = this.getExporter('JournalEntry');
      for (const document of avPack.journal) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].journals[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.journals ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Cards
      exporter = this.getExporter('Cards');
      for (const document of avPack.cards) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].cards[key] = foundry.utils.mergeObject(
          await exporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.cards ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Remove empty collections
      for (const key in this.dataset.entries[avPack.name]) {
        if (0 === Object.keys(this.dataset.entries[avPack.name][key]).length) {
          delete this.dataset.entries[avPack.name][key];
        } else if (this.options.sortEntries && !['name', 'caption', 'description'].includes(key)) {
          this.dataset.entries[avPack.name][key] = this._sortItems(this.dataset.entries[avPack.name][key]);
        }
      }
    }
  }
}

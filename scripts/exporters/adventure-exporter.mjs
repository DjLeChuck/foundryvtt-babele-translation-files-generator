import { AbstractExporter } from './abstract-exporter.mjs';
import * as exporters from './_index.mjs';

export class AdventureExporter extends AbstractExporter {
  async _processDataset() {
    const avPackIndex = await this.pack.getIndex({
      fields: ['caption', 'scenes', 'macros', 'playlists', 'actors', 'items', 'tables', 'folders', 'journal', 'cards'],
    });

    avPackIndex.contents.forEach((avPack) => {
      this.progressTotalElements += avPack.scenes.length + avPack.macros.length + avPack.playlists.length
        + avPack.actors.length + avPack.items.length + avPack.tables.length + avPack.folders.length
        + avPack.journal.length + avPack.cards.length;
    });

    avPackIndex.contents.forEach((avPack) => {
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
      for (const document of avPack.scenes) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].scenes[key] = foundry.utils.mergeObject(
          exporters.SceneExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.scenes ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Macros
      for (const document of avPack.macros) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].macros[key] = foundry.utils.mergeObject(
          exporters.MacroExporter.getDocumentData(document),
          (this.existingContent[avPack.name]?.macros ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Playlists
      for (const document of avPack.playlists) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].playlists[key] = foundry.utils.mergeObject(
          exporters.PlaylistExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.playlists ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Actors
      for (const document of avPack.actors) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].actors[key] = foundry.utils.mergeObject(
          exporters.ActorExporter.getDocumentData(
            document,
            document,
            this.options.customMapping.actor,
          ),
          (this.existingContent[avPack.name]?.actors ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Items
      for (const document of avPack.items) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].items[key] = foundry.utils.mergeObject(
          exporters.ItemExporter.getDocumentData(
            document,
            this.options.customMapping.item,
          ),
          (this.existingContent[avPack.name]?.items ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Tables
      for (const document of avPack.tables) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].tables[key] = foundry.utils.mergeObject(
          exporters.RollTableExporter.getDocumentData(document, document),
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
      for (const document of avPack.journal) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].journals[key] = foundry.utils.mergeObject(
          exporters.JournalEntryExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.journals ?? {})[key] ?? {},
        );

        this._stepProgressBar();
      }

      // Cards
      for (const document of avPack.cards) {
        const key = this._getExportKey(document);
        this.dataset.entries[avPack.name].cards[key] = foundry.utils.mergeObject(
          exporters.CardsExporter.getDocumentData(document, document),
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
    });
  }
}

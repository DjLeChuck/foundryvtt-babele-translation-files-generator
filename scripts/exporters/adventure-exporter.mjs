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
        this.dataset.entries[avPack.name].scenes[document.name] = foundry.utils.mergeObject(
          exporters.SceneExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.scenes ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Macros
      for (const document of avPack.macros) {
        this.dataset.entries[avPack.name].macros[document.name] = foundry.utils.mergeObject(
          exporters.MacroExporter.getDocumentData(document),
          (this.existingContent[avPack.name]?.macros ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Playlists
      for (const document of avPack.playlists) {
        this.dataset.entries[avPack.name].playlists[document.name] = foundry.utils.mergeObject(
          exporters.PlaylistExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.playlists ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Actors
      for (const document of avPack.actors) {
        this.dataset.entries[avPack.name].actors[document.name] = foundry.utils.mergeObject(
          exporters.ActorExporter.getDocumentData(
            document,
            document,
            this.options.customMapping.actor,
          ),
          (this.existingContent[avPack.name]?.actors ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Items
      for (const document of avPack.items) {
        this.dataset.entries[avPack.name].items[document.name] = foundry.utils.mergeObject(
          exporters.ItemExporter.getDocumentData(
            document,
            this.options.customMapping.item,
          ),
          (this.existingContent[avPack.name]?.items ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Tables
      for (const document of avPack.tables) {
        this.dataset.entries[avPack.name].tables[document.name] = foundry.utils.mergeObject(
          exporters.RollTableExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.tables ?? {})[document.name] ?? {},
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
        this.dataset.entries[avPack.name].journals[document.name] = foundry.utils.mergeObject(
          exporters.JournalEntryExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.journals ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Cards
      for (const document of avPack.cards) {
        this.dataset.entries[avPack.name].cards[document.name] = foundry.utils.mergeObject(
          exporters.CardsExporter.getDocumentData(document, document),
          (this.existingContent[avPack.name]?.cards ?? {})[document.name] ?? {},
        );

        this._stepProgressBar();
      }

      // Remove empty collections
      for (const key in this.dataset.entries[avPack.name]) {
        if (0 === Object.keys(this.dataset.entries[avPack.name][key]).length) {
          delete this.dataset.entries[avPack.name][key];
        }
      }
    });
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class AdventureExporter extends AbstractExporter {
  async _processDataset() {
    const avPack = await this.pack.getDocument([...this.pack.index][0]._id);

    this.dataset.entries = {
      [avPack.name]: {
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
      },
    };

    // Scenes
    avPack.scenes.forEach(({ name }) => this.dataset.entries[avPack.name].scenes[name] = { name });

    // Macros
    avPack.macros.forEach(({ name }) => this.dataset.entries[avPack.name].macros[name] = { name });

    // Playlists
    avPack.playlists.forEach(({ name, description }) => this.dataset.entries[avPack.name].playlists[name] = {
      name,
      description,
    });

    // Actors
    avPack.actors.forEach(({ name }) => this.dataset.entries[avPack.name].actors[name] = { name, tokenName: name });

    // Items
    avPack.items.forEach(({ name }) => this.dataset.entries[avPack.name].items[name] = { name, id: name });

    // Tables
    avPack.tables.forEach(({ name, description, results }) => {
      const resultsDataset = {};

      results.forEach(({ range, text }) => resultsDataset[`${range[0]}-${range[1]}`] = text);

      this.dataset.entries[avPack.name].tables[name] = { name, description, results: resultsDataset };
    });

    // Folders
    avPack.folders.forEach(({ name }) => this.dataset.entries[avPack.name].folders[name] = name);

    // Journals
    avPack.journal.forEach(({ name, pages }) => {
      const pagesDataset = {};

      pages.forEach(({ name, text: { content: text } }) => pagesDataset[name] = { name, text });

      this.dataset.entries[avPack.name].journals[name] = { name, pages: pagesDataset };
    });

    // Cards
    avPack.cards.forEach(({ name, description, cards }) => {
      const cardsDataset = {};

      cards.forEach(({ name, description, faces, back }) => cardsDataset[name] = { name, description, back, faces });

      this.dataset.entries[avPack.name].cards[name] = { name, description, cards: cardsDataset };
    });

    // Remove empty collections
    for (const key in this.dataset.entries[avPack.name]) {
      if (0 === Object.keys(this.dataset.entries[avPack.name][key]).length) {
        delete this.dataset.entries[avPack.name][key];
      }
    }
  }
}

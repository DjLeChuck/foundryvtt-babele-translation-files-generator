import { AbstractExporter } from './abstract-exporter.mjs';

export class CardsExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: [...this.options.customMapping.map((mapping) => mapping.value)],
    });

    for (const { _id, name, description, ...rest } of documents) {
      const documentData = { name, description, cards: {} };

      this._addCustomMapping(documentData, rest);

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

      for (const { name, description, back, faces } of document.cards) {
        documentData.cards[name] = { name, description, back, faces };
      }

      this._stepProgressBar();
    }
  }
}

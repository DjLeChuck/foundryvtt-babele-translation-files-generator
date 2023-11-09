import { AbstractExporter } from './abstract-exporter.mjs';

export class CardsExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const { _id, name, description } of documents) {
      const documentData = { name, description };

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

      if (document.cards.size) {
        documentData.cards = {};

        for (const { name, description, back, faces } of document.cards) {
          documentData.cards[name] = { name, description, back, faces };
        }
      }

      this._stepProgressBar();
    }
  }
}

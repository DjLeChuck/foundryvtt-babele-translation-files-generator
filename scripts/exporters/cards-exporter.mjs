import { AbstractExporter } from './abstract-exporter.mjs';

export class CardsExporter extends AbstractExporter {
  static async getDocumentData(indexDocument, pack) {
    const { _id, name, description } = indexDocument;

    const documentData = { name, description };

    const document = await pack.getDocument(_id);

    if (document.cards.size) {
      documentData.cards = {};

      for (const { name, description, back, faces } of document.cards) {
        documentData.cards[name] = { name, description, back, faces };
      }
    }

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = await CardsExporter.getDocumentData(indexDocument, this.pack);

      this._stepProgressBar();
    }
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class RollTableExporter extends AbstractExporter {
  static async getDocumentData(indexDocument, pack) {
    const { _id, name, description } = indexDocument;
    const documentData = { name, description };

    const document = await pack.getDocument(_id);

    if (document.results.size) {
      documentData.results = {};

      for (const { range, text } of document.results) {
        documentData.results[`${range[0]}-${range[1]}`] = text;
      }
    }

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = await RollTableExporter.getDocumentData(indexDocument, this.pack);

      this._stepProgressBar();
    }
  }
}

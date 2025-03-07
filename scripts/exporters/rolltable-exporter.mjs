import { AbstractExporter } from './abstract-exporter.mjs';

export class RollTableExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document) {
    const { name, description } = indexDocument;
    const documentData = { name, description };

    if (AbstractExporter._hasContent(document.results)) {
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
      const key = this._getExportKey(indexDocument);
      this.dataset.entries[key] = foundry.utils.mergeObject(
        RollTableExporter.getDocumentData(
          indexDocument,
          await this.pack.getDocument(indexDocument._id),
        ),
        this.existingContent[key] ?? {},
      );

      this._stepProgressBar();
    }
  }
}

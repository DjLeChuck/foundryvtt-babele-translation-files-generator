import { AbstractExporter } from './abstract-exporter.mjs';

export class RollTableExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {RollTableData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name, description } = indexDocument;
    const documentData = { name, description };

    if (this._notEmpty(document.results)) {
      documentData.results = {};

      for (const { range, description, name, img, weight } of document.results) {
        const key = `${range[0]}-${range[1]}`;
        documentData.results[key] = {};

        if (description) {
          documentData.results[key].description = description;
        }

        if (name) {
          documentData.results[key].name = name;
        }

        if (weight) {
          documentData.results[key].weight = weight;
        }

        if (img) {
          documentData.results[key].img = img;
        }
      }
    }

    return documentData;
  }
}

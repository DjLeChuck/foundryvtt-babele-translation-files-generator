import { AbstractExporter } from './abstract-exporter.mjs';

export class RollTableExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {RollTableData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name } = indexDocument;
    const documentData = { name };

    this._addIfDefined(indexDocument, documentData, 'description');

    if (this._notEmpty(document.results)) {
      documentData.results = {};

      for (const result of document.results) {
        const range = result.range;
        const key = `${range[0]}-${range[1]}`;
        documentData.results[key] = {};

        this._addIfDefined(result, documentData.results[key], 'description');
        this._addIfDefined(result, documentData.results[key], 'name');
      }
    }

    return documentData;
  }
}

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
        for (const result of document.results) {
            const { range, name, description: resultDesc } = result; 
            const rangeKey = `${range[0]}-${range[1]}`;

            const resultData = { name };

            if (resultDesc !== undefined && resultDesc !== '') {
                resultData.description = resultDesc;
            }

            documentData.results[rangeKey] = resultData;
        }
    }
    return documentData;
}

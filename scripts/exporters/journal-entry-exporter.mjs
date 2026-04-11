import { AbstractExporter } from './abstract-exporter.mjs';

export class JournalEntryExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {JournalEntryData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name } = indexDocument;
    const documentData = { name };

    if (this._notEmpty(document.categories)) {
      documentData.categories = Object.fromEntries(
        document.categories.map((c) => [c.name, c.name]),
      );
    }

    if (this._notEmpty(document.pages)) {
      documentData.pages = {};

      for (const page of document.pages) {
        const pageData = { name: page.name };

        this._addIfDefined(page, pageData, 'caption', 'img.caption');
        this._addIfDefined(page, pageData, 'src');
        this._addIfDefined(page, pageData, 'width', 'video.width');
        this._addIfDefined(page, pageData, 'height', 'video.height');
        this._addIfDefined(page, pageData, 'text', 'content.text');

        documentData.pages[page.name] = pageData;
      }
    }

    return documentData;
  }
}

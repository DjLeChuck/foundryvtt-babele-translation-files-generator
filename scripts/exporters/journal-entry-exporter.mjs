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

      for (const {
        name,
        image: { caption } = {},
        src,
        video: { width, height } = {},
        text: { content: text } = {}
      } of document.pages) {
        const pageData = { name };

        if (caption) {
          pageData.caption = caption;
        }

        if (src) {
          pageData.src = src;
        }

        if (width) {
          pageData.width = width;
        }

        if (height) {
          pageData.height = height;
        }

        if (text) {
          pageData.text = text;
        }

        documentData.pages[name] = pageData;
      }
    }

    return documentData;
  }
}

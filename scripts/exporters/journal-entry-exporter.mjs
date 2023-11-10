import { AbstractExporter } from './abstract-exporter.mjs';

export class JournalEntryExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document) {
    const { name } = indexDocument;
    const documentData = { name };

    if (AbstractExporter._hasContent(document.pages)) {
      documentData.pages = {};

      for (const {
        name,
        image: { caption },
        src,
        video: { width, height },
        text: { content: text }
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

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = JournalEntryExporter.getDocumentData(
        indexDocument,
        await this.pack.getDocument(indexDocument._id),
      );

      this._stepProgressBar();
    }
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class JournalEntryExporter extends AbstractExporter {
  static async getDocumentData(indexDocument, pack) {
    const { _id, name } = indexDocument;
    const documentData = { name };

    const document = await pack.getDocument(_id);

    if (document.pages.size) {
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
      this.dataset.entries[indexDocument.name] = await JournalEntryExporter.getDocumentData(indexDocument, this.pack);

      this._stepProgressBar();
    }
  }
}

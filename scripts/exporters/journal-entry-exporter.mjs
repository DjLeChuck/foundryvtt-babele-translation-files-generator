import { AbstractExporter } from './abstract-exporter.mjs';

export class JournalEntryExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const { _id, name } of documents) {
      const documentData = { name };

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

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

      this._stepProgressBar();
    }
  }
}

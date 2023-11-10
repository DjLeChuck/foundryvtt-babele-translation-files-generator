import { AbstractExporter } from './abstract-exporter.mjs';

export class SceneExporter extends AbstractExporter {
  static async getDocumentData(indexDocument, pack) {
    const { _id, name } = indexDocument;
    const documentData = { name };

    const document = await pack.getDocument(_id);

    if (document.drawings.size) {
      documentData.drawings = {};

      for (const { text } of document.drawings) {
        documentData.drawings[text] = text;
      }
    }

    if (document.notes.size) {
      documentData.notes = {};

      for (const { text } of document.notes) {
        documentData.notes[text] = text;
      }
    }

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = await SceneExporter.getDocumentData(indexDocument, this.pack);

      this._stepProgressBar();
    }
  }
}

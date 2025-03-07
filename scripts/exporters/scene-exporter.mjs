import { AbstractExporter } from './abstract-exporter.mjs';

export class SceneExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document) {
    const { name } = indexDocument;
    const documentData = { name };

    if (AbstractExporter._hasContent(document.drawings)) {
      documentData.drawings = {};

      for (const { text } of document.drawings) {
        if (text.length) {
          documentData.drawings[text] = text;
        }
      }
    }

    if (AbstractExporter._hasContent(document.notes)) {
      documentData.notes = {};

      for (const { text } of document.notes) {
        if (text.length) {
          documentData.notes[text] = text;
        }
      }
    }

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      const key = this.options.useIdAsKey ? indexDocument._id : indexDocument.name;
      this.dataset.entries[key] = foundry.utils.mergeObject(
        SceneExporter.getDocumentData(
          indexDocument,
          await this.pack.getDocument(indexDocument._id),
        ),
        this.existingContent[key] ?? {},
      );

      this._stepProgressBar();
    }
  }
}

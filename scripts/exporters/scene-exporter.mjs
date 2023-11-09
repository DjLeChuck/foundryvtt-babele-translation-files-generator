import { AbstractExporter } from './abstract-exporter.mjs';

export class SceneExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const { _id, name } of documents) {
      const documentData = { name };

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

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

      this._stepProgressBar();
    }
  }
}

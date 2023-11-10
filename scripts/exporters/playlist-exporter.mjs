import { AbstractExporter } from './abstract-exporter.mjs';

export class PlaylistExporter extends AbstractExporter {
  static async getDocumentData(indexDocument, pack) {
    const { _id, name, description } = indexDocument;
    const documentData = { name, description };

    const document = await pack.getDocument(_id);

    if (document.sounds.size) {
      documentData.sounds = {};

      for (const { name, description } of document.sounds) {
        documentData.sounds[name] = { name, description };
      }
    }

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = await PlaylistExporter.getDocumentData(indexDocument, this.pack);

      this._stepProgressBar();
    }
  }
}

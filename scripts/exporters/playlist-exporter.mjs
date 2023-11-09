import { AbstractExporter } from './abstract-exporter.mjs';

export class PlaylistExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const { _id, name, description } of documents) {
      const documentData = { name, description };

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

      if (document.sounds.size) {
        documentData.sounds = {};

        for (const { name, description } of document.sounds) {
          documentData.sounds[name] = { name, description };
        }
      }

      this._stepProgressBar();
    }
  }
}

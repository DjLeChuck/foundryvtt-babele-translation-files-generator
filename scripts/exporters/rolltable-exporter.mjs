import { AbstractExporter } from './abstract-exporter.mjs';

export class RollTableExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex();

    for (const { _id, name, description } of documents) {
      const documentData = { name, description, results: {} };

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

      for (const { range, text } of document.results) {
        documentData.results[`${range[0]}-${range[1]}`] = text;
      }

      this._stepProgressBar();
    }
  }
}

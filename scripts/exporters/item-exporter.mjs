import { AbstractExporter } from './abstract-exporter.mjs';

export class ItemExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getDocuments();

    documents.forEach(({ name }) => {
      this.dataset.entries[name] = { name };
    });
  }
}

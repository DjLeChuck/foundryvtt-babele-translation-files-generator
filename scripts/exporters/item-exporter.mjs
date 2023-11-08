import { AbstractExporter } from './abstract-exporter.mjs';

export class ItemExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: [...this.options.customMapping.map((mapping) => mapping.value)],
    });

    for (const { name, ...rest } of documents) {
      const documentData = { name };

      this._addCustomMapping(documentData, rest);

      this.dataset.entries[name] = documentData;

      this._stepProgressBar();
    }
  }
}

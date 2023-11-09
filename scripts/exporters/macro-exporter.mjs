import { AbstractExporter } from './abstract-exporter.mjs';

export class MacroExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex({ fields: ['command'] });

    for (const { name, command } of documents) {
      this.dataset.entries[name] = { name, command };

      this._stepProgressBar();
    }
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class MacroExporter extends AbstractExporter {
  static getDocumentData(indexDocument) {
    const { name, command } = indexDocument;

    return { name, command };
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({ fields: ['command'] });

    for (const indexDocument of documents) {
      const key = this.options.useIdAsKey ? indexDocument._id : indexDocument.name;
      this.dataset.entries[key] = foundry.utils.mergeObject(
        MacroExporter.getDocumentData(indexDocument),
        this.existingContent[key] ?? {},
      );

      this._stepProgressBar();
    }
  }
}

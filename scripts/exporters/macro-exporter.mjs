import { AbstractExporter } from './abstract-exporter.mjs';

export class MacroExporter extends AbstractExporter {
  static getDocumentData(indexDocument) {
    const { name, command } = indexDocument;

    return { name, command };
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({ fields: ['command'] });

    for (const indexDocument of documents) {
      this.dataset.entries[indexDocument.name] = foundry.utils.mergeObject(
        MacroExporter.getDocumentData(indexDocument),
        this.existingContent[indexDocument.name] ?? {},
      );

      this._stepProgressBar();
    }
  }
}

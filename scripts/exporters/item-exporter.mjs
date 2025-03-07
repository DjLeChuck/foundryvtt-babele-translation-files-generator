import { AbstractExporter } from './abstract-exporter.mjs';

export class ItemExporter extends AbstractExporter {
  static getDocumentData(indexDocument, customMapping) {
    const { name } = indexDocument;
    const documentData = { name };

    AbstractExporter._addCustomMapping(customMapping, indexDocument, documentData);

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: [...Object.values(this.options.customMapping.item).map((mapping) => mapping.value)],
    });
    
    for (const indexDocument of documents) {     
      const key = this.options.useIdAsKey ? indexDocument._id : indexDocument.name;
      this.dataset.entries[key] = foundry.utils.mergeObject(
        ItemExporter.getDocumentData(
          indexDocument,
          this.options.customMapping.item,
        ),
        this.existingContent[key] ?? {},
      );

      this._stepProgressBar();
    }
  }
}

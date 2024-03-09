import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document, customMapping) {
    const documentData = {
      name: indexDocument.name,
      description: document.system && document.system.description ? document.system.description.value : "", // Check for existence
      items: document.items.map(item => ({
          id: item._id,
          name: item.name,
          description: item.system && item.system.description ? item.system.description.value : "" // Check for existence
      }))
  };

    // This integrates any custom mapping fields you might have
    AbstractExporter._addCustomMapping(customMapping, indexDocument, documentData);

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: [
        'prototypeToken.name',
        'system.description.value', // Ensure you add fields relevant for your custom mapping here
        ...Object.values(this.options.customMapping.actor).map((mapping) => mapping.value),
      ],
    });

    for (const indexDocument of documents) {
        const document = await this.pack.getDocument(indexDocument._id);
        let documentData = ActorExporter.getDocumentData(
            indexDocument,
            document,
            this.options.customMapping.actor,
        );

        // Processing items with detailed information
        if (document.items.size) {
            documentData.items = document.items.map(item => ({
                id: item._id,
                name: item.name,
                description: item.system.description.value // Ensure correct path based on your data structure
            }));
        }

        // Apply custom mappings here if needed. Modify or extend documentData based on custom rules

        documentData = foundry.utils.mergeObject(documentData, this.existingContent[indexDocument.name] ?? {});

        this.dataset.entries[indexDocument.name] = documentData;

        this._stepProgressBar();
    }
  }

}

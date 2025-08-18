import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document, customMapping) {
    const { name, prototypeToken: { name: tokenName } = {} } = indexDocument;
    const documentData = { name, tokenName: tokenName ?? name };

    if (AbstractExporter._hasContent(document.items)) {
      documentData.items = {};

      for (const item of document.items) {
        const { name } = item;
        const itemData = { name };
        AbstractExporter._addCustomMapping(itemsMapping, item, itemData);
        documentData.items[useIdKey ? item._id : item.name] = itemData;
      }
    }

    AbstractExporter._addCustomMapping(customMapping, indexDocument, documentData);

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: [
        'prototypeToken.name',
        ...Object.values(this.options.customMapping.actor).map((mapping) => mapping.value),
      ],
    });

    for (const indexDocument of documents) {
      let documentData = ActorExporter.getDocumentData(
        indexDocument,
        await this.pack.getDocument(indexDocument._id),
        this.options.customMapping.actor,
      );

      const key = this._getExportKey(indexDocument);

      this.dataset.entries[key] = documentData;

      const document = await this.pack.getDocument(indexDocument._id);

      if (document.items.size) {
        documentData.items = {};

        for (const { name } of document.items) {
          documentData.items[name] = { name };
        }
      }

      documentData = foundry.utils.mergeObject(documentData, this.existingContent[key] ?? {});

      this._stepProgressBar();
    }
  }
}

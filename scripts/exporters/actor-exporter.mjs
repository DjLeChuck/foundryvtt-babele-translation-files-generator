import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  static getDocumentData(indexDocument, document, customMapping) {
    const { name, prototypeToken: { name: tokenName } = {} } = indexDocument;
    const documentData = { name, tokenName: tokenName ?? name };

    if (AbstractExporter._hasContent(document.items)) {
      documentData.items = {};

      for (const { name } of document.items) {
        documentData.items[name] = { name };
      }
    }

    AbstractExporter._addCustomMapping(customMapping, indexDocument, documentData);

    return documentData;
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: ['prototypeToken.name', ...this.options.customMapping.map((mapping) => mapping.value)],
    });

    for (const indexDocument of documents) {
      const documentData = ActorExporter.getDocumentData(
        indexDocument,
        await this.pack.getDocument(indexDocument._id),
        this.options.customMapping,
      );

      this.dataset.entries[indexDocument.name] = documentData;

      const document = await this.pack.getDocument(indexDocument._id);

      if (document.items.size) {
        documentData.items = {};

        for (const { name } of document.items) {
          documentData.items[name] = { name };
        }
      }

      this._stepProgressBar();
    }
  }
}

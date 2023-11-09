import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: ['prototypeToken.name', ...this.options.customMapping.map((mapping) => mapping.value)],
    });

    for (const { _id, name, items, prototypeToken: { name: tokenName } = {}, ...rest } of documents) {
      const documentData = { name, tokenName: tokenName ?? name };

      this._addCustomMapping(documentData, rest);

      this.dataset.entries[name] = documentData;

      const document = await this.pack.getDocument(_id);

      if (document.items.size) {
        documentData.items = {};

        for (const { _id, name } of document.items) {
          documentData.items[_id] = { name };
        }
      }

      this._stepProgressBar();
    }
  }
}

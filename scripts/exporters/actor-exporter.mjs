import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getIndex({
      fields: ['prototypeToken.name', 'items._id', ...this.options.customMapping.map((mapping) => mapping.value)],
    });

    for (const { name, items, prototypeToken: { name: tokenName } = {}, ...rest } of documents) {
      const documentData = { name, tokenName: tokenName ?? name };

      this._addCustomMapping(documentData, rest);

      this.dataset.entries[name] = documentData;

      this._stepProgressBar();
    }
  }
}

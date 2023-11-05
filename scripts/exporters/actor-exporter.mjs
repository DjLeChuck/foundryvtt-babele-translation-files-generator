import { AbstractExporter } from './abstract-exporter.mjs';

export class ActorExporter extends AbstractExporter {
  async _processDataset() {
    const documents = await this.pack.getDocuments();

    documents.forEach(({ name, items, prototypeToken: { name: tokenName } }) => {
      const itemsDataset = {};

      items.forEach(({ name }) => {
        itemsDataset[name] = { name };
      });

      this.dataset.entries[name] = { name, tokenName, items: itemsDataset };
    });
  }
}

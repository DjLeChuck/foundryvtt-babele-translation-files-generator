export class AbstractExporter {
  options = {
    sortEntries: false,
  };
  dataset = {
    label: '',
    entries: {},
  };
  /**
   * @typedef {CompendiumCollection}
   */
  pack;

  constructor(pack, options) {
    if (this.constructor === AbstractExporter) {
      throw new TypeError('Abstract class "AbstractExporter" cannot be instantiated directly');
    }

    this.options = options;
    this.pack = pack;
    this.dataset.label = this.pack.metadata.label;
  }

  async export() {
    ui.notifications.info(`Processing compendium ${this.pack.metadata.name}. Please be patient, it can take a while depending on the data present inside.`);

    await this._processDataset();

    if (this.options.sortEntries) {
      this._sortEntries();
    }

    this._downloadFile();
  }

  _processDataset() {
    throw new Error('You must implement this function');
  }

  _downloadFile() {
    ui.notifications.info('Export finished!');

    saveDataToFile(JSON.stringify(this.dataset, null, 2), 'text/json', `${this.pack.metadata.id}.json`);
  }

  _sortEntries() {
    this.dataset.entries = Object.keys(this.dataset.entries)
      .sort()
      .reduce((acc, key) => ({
        ...acc,
        [key]: this.dataset.entries[key],
      }), {});
  }
}

export class AbstractExporter {
  options = {
    sortEntries: false,
    customMapping: [],
  };
  dataset = {
    label: '',
    mapping: {},
    entries: {},
  };
  /**
   * @typedef {CompendiumCollection}
   */
  pack;

  progessNbImported;
  progessMessage;
  progressTotalElements;

  constructor(pack, options) {
    if (this.constructor === AbstractExporter) {
      throw new TypeError('Abstract class "AbstractExporter" cannot be instantiated directly');
    }

    this.options = options;
    this.pack = pack;
    this.dataset.label = pack.metadata.label;
    this.progessNbImported = 0;
    this.progessMessage = game.i18n.localize('BTFG.Exporter.ExportRunning');
    this.progressTotalElements = pack.index.size;
  }

  async export() {
    ui.notifications.info(game.i18n.format('BTFG.Exporter.PleaseWait', { label: this.pack.metadata.label }));

    this._startProgressBar();

    await this._processCustomMapping();
    await this._processDataset();

    if (this.options.sortEntries) {
      this._sortEntries();
    }

    this._endProgressBar();

    this._downloadFile();
  }

  async _processCustomMapping() {
    if (0 === this.options.customMapping.length) {
      delete this.dataset.mapping;

      return;
    }

    this.options.customMapping.forEach(({ key, value }) => this.dataset.mapping[key] = value);
  }

  async _processDataset() {
    throw new Error('You must implement this function');
  }

  static _addCustomMapping(customMapping, indexDocument, documentData) {
    const flattenDocument = foundry.utils.flattenObject(indexDocument);

    customMapping.forEach(({ key, value }) => {
      if (flattenDocument.hasOwnProperty(value)) {
        documentData[key] = flattenDocument[value];
      }
    });
  }

  static _hasContent(dataset) {
    return Array.isArray(dataset) ? dataset.length : dataset.size;
  }

  _downloadFile() {
    ui.notifications.info(game.i18n.localize('BTFG.Exporter.ExportFinished'));

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

  _startProgressBar() {
    SceneNavigation.displayProgressBar({ label: this.progessMessage, pct: 1 });
  }

  _stepProgressBar() {
    ++this.progessNbImported;

    SceneNavigation.displayProgressBar({
      label: this.progessMessage,
      pct: Math.floor(this.progessNbImported * 100 / this.progressTotalElements),
    });
  }

  _endProgressBar() {
    SceneNavigation.displayProgressBar({ label: this.progessMessage, pct: 100 });
  }
}

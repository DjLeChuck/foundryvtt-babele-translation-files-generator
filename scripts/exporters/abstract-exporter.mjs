export class AbstractExporter {
  options;
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
    switch (this.pack.metadata.type) {
      case 'Actor':
        Object.values(this.options.customMapping.actor).forEach(({ key, value }) => this.dataset.mapping[key] = value);

        break;
      case 'Adventure':
        this.dataset.mapping = { actors: {}, items: {} };

        Object.values(this.options.customMapping.actor).forEach(
          ({ key, value }) => this.dataset.mapping.actors[key] = value,
        );
        Object.values(this.options.customMapping.item).forEach(
          ({ key, value }) => this.dataset.mapping.items[key] = value,
        );

        break;
      case 'Item':
        Object.values(this.options.customMapping.item).forEach(({ key, value }) => this.dataset.mapping[key] = value);

        break;
    }

    if (0 === Object.keys(this.dataset.mapping).length) {
      delete this.dataset.mapping;
    }
  }

  async _processDataset() {
    throw new Error('You must implement this function');
  }

  static _addCustomMapping(customMapping, indexDocument, documentData) {
    const flattenDocument = foundry.utils.flattenObject(indexDocument);

    Object.values(customMapping).forEach(({ key, value }) => {
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

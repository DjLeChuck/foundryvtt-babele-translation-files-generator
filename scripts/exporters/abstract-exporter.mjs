import JSZip from '../vendors/jszip/jszip.min.js';
import FileSaver from '../vendors/filesaver/FileSaver.min.js';

const MODULE_TPL_BASE_URI = './modules/babele-translation-files-generator/_module_tpl';
const MODULE_TPL_ID = 'your-module-id';

/**
 * @typedef {import('../app/compendium-exporter-data-model.mjs').ExporterOptions} ExporterOptions
 */
export class AbstractExporter {
  /** @type {import('./exporter-manager.mjs').ExporterManager} */
  #manager;

  dataset = {
    label: '',
    mapping: {},
    folders: {},
    entries: {},
  };

  _progress;
  progressNbImported;
  progressMessage;
  progressTotalElements;

  /**
   * @param {import('./exporter-manager.mjs').ExporterManager} manager
   */
  constructor(manager) {
    if (this.constructor === AbstractExporter) {
      throw new TypeError('Abstract class "AbstractExporter" cannot be instantiated directly');
    }

    this.#manager = manager;
    this.existingContent = {};
    this.existingFolders = {};
    this.dataset.label = manager.pack.metadata.label;
    this.progressNbImported = 0;
    this.progressMessage = game.i18n.localize('BTFG.Exporter.ExportRunning');
    this.progressTotalElements = manager.pack.index.size;
  }

  /** @returns {CompendiumCollection} */
  get pack() {
    return this.#manager.pack;
  }

  /** @returns {ExporterOptions} */
  get options() {
    return this.#manager.options;
  }

  /** @returns {File|null} */
  get existingFile() {
    return this.#manager.existingFile;
  }

  /**
   * Returns the exporter instance for the given type.
   *
   * @param {string} type
   * @returns {AbstractExporter}
   */
  getExporter(type) {
    return this.#manager.getExporter(type);
  }

  async export() {
    ui.notifications.info(game.i18n.format('BTFG.Exporter.PleaseWait', { label: this.pack.metadata.label }));

    this._startProgressBar();

    await this._processExistingEntries();
    await this._processCustomMapping();
    await this._processDataset();
    await this._processFolders();

    if (this.options.sortEntries) {
      this.dataset.entries = this._sortItems(this.dataset.entries);
      this.dataset.folders = this._sortItems(this.dataset.folders);
    }

    this._removeEmptyDatasetEntries();

    this._endProgressBar();

    if (this.options.generateModule) {
      await this._generateModule();
    } else {
      this._downloadFile();
    }
  }

  /**
   * @abstract
   * @param {Object} indexDocument
   * @param {Object} document
   * @returns {Promise<Object>}
   */
  async getDocumentData(indexDocument, document) {
    throw new Error('You must implement this function');
  }

  async _processExistingEntries() {
    if (!this.existingFile) {
      return;
    }

    try {
      const jsonString = await foundry.utils.readTextFromFile(this.existingFile);
      const json = JSON.parse(jsonString);

      if (!json?.entries) {
        return ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotGenerateModule', {
          name: this.existingFile.name,
        }));
      }

      this.existingContent = json.entries;
      this.existingFolders = json.folders ?? {};
      this.dataset.label = json.label ?? this.dataset.label;
    } catch (err) {
      return ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: this.existingFile.name,
      }));
    }
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
  }

  _getIndexFields() {
    return [];
  }

  async _processDocumentData(indexDocument, documentData) {
  }

  async _processDataset() {
    const documents = await this.pack.getIndex({ fields: this._getIndexFields() });

    for (const indexDocument of documents) {
      const key = this._getExportKey(indexDocument);
      const documentData = await this.getDocumentData(
        indexDocument,
        await this.pack.getDocument(indexDocument._id),
      );

      await this._processDocumentData(indexDocument, documentData);

      Hooks.callAll('BTFG.afterDocumentProcessed', indexDocument, documentData, this.options);
      Hooks.callAll(`BTFG.after${this.pack.metadata.type}DocumentProcessed`, indexDocument, documentData, this.options);

      this.dataset.entries[key] = foundry.utils.mergeObject(
        documentData,
        this.existingContent[key] ?? {},
      );

      this._stepProgressBar();
    }
  }

  async _processFolders() {
    this.pack.folders.forEach((folder) => {
      const name = folder.name;
      this.dataset.folders[name] = this.existingFolders[name] ?? name;
    });
  }

  _addCustomMapping(customMapping, indexDocument, documentData) {
    const flattenDocument = foundry.utils.flattenObject(indexDocument);

    Object.values(customMapping).forEach(({ key, value }) => {
      if (foundry.utils.hasProperty(flattenDocument, value)) {
        const documentValue = foundry.utils.getProperty(flattenDocument, value);

        if (!this.options.excludeEmptyString || '' !== documentValue) {
          documentData[key] = foundry.utils.getProperty(flattenDocument, value);
        }
      }
    });
  }

  _notEmpty(dataset) {
    if (typeof dataset === 'undefined') {
      return false;
    }

    return 0 < (Array.isArray(dataset) ? dataset.length : dataset.size);
  }

  _getStringifiedDataset() {
    return JSON.stringify(this.dataset, null, 2);
  }

  _downloadFile() {
    ui.notifications.info(game.i18n.localize('BTFG.Exporter.ExportFinished'));

    foundry.utils.saveDataToFile(this._getStringifiedDataset(), 'text/json', `${this.pack.metadata.id}.json`);
  }

  _sortItems(items) {
    return Object.keys(items)
      .sort()
      .reduce((acc, key) => ({
        ...acc,
        [key]: items[key],
      }), {});
  }

  async _generateModule() {
    try {
      const zip = new JSZip();

      const readme = await fetch(`${MODULE_TPL_BASE_URI}/README.md`);
      zip.file(`${MODULE_TPL_ID}/README.md`, await readme.text());

      const module = await fetch(`${MODULE_TPL_BASE_URI}/_module.json`);
      zip.file(`${MODULE_TPL_ID}/module.json`, await module.text());

      const register = await fetch(`${MODULE_TPL_BASE_URI}/register.js`);
      zip.file(`${MODULE_TPL_ID}/register.js`, (await register.text()).replaceAll('##LOCALE##', this.options.translationLocale));

      zip.file(
        `${MODULE_TPL_ID}/compendium/${this.options.translationLocale}/${this.pack.metadata.id}.json`,
        this._getStringifiedDataset(),
      );

      ui.notifications.info(game.i18n.localize('BTFG.Exporter.ExportFinished'));

      FileSaver.saveAs(await zip.generateAsync({ type: 'blob' }), 'your-module-id.zip');
    } catch (err) {
      ui.notifications.error(game.i18n.localize('BTFG.Errors.CanNotGenerateModule'));

      console.error(err);
    }
  }

  _startProgressBar() {
    this._progress = ui.notifications.info(this.progressMessage, { progress: true });
  }

  _stepProgressBar() {
    ++this.progressNbImported;

    this._progress.update({
      message: this.progressMessage,
      pct: this.progressNbImported / this.progressTotalElements,
    });
  }

  _endProgressBar() {
    this._progress.update({
      message: this.progressMessage,
      pct: 1.0,
    });
  }

  _getExportKey(document) {
    return this.options.useIdAsKey ? document._id : document.name;
  }

  _removeEmptyDatasetEntries() {
    if (0 === Object.keys(this.dataset.mapping).length) {
      delete this.dataset.mapping;
    }

    if (0 === Object.keys(this.dataset.entries).length) {
      delete this.dataset.entries;
    }

    if (0 === Object.keys(this.dataset.folders).length) {
      delete this.dataset.folders;
    }
  }
}

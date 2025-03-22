import JSZip from '../vendors/jszip/jszip.min.js';
import FileSaver from '../vendors/filesaver/FileSaver.min.js';

const MODULE_TPL_BASE_URI = './modules/babele-translation-files-generator/_module_tpl';
const MODULE_TPL_ID = 'your-module-id';

export class AbstractExporter {
  options;
  dataset = {
    label: '',
    mapping: {},
    folders: {},
    entries: {},
  };
  /**
   * @typedef {CompendiumCollection}
   */
  pack;

  progressNbImported;
  progressMessage;
  progressTotalElements;

  constructor(pack, options, existingFile) {
    if (this.constructor === AbstractExporter) {
      throw new TypeError('Abstract class "AbstractExporter" cannot be instantiated directly');
    }

    this.options = options;
    this.pack = pack;
    this.existingFile = existingFile;
    this.existingContent = {};
    this.existingFolders = {};
    this.dataset.label = pack.metadata.label;
    this.progressNbImported = 0;
    this.progressMessage = game.i18n.localize('BTFG.Exporter.ExportRunning');
    this.progressTotalElements = pack.index.size;
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

    this._endProgressBar();

    if (this.options.generateModule) {
      await this._generateModule();
    } else {
      this._downloadFile();
    }
  }

  async _processExistingEntries() {
    if (!this.existingFile) {
      return;
    }

    try {
      const jsonString = await readTextFromFile(this.existingFile);
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

    if (0 === Object.keys(this.dataset.mapping).length) {
      delete this.dataset.mapping;
    }
  }

  async _processDataset() {
    throw new Error('You must implement this function');
  }

  async _processFolders() {
    this.pack.folders.forEach((folder) => {
      const name = folder.name;
      this.dataset.folders[name] = this.existingFolders[name] ?? name;
    });
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

  _getStringifiedDataset() {
    return JSON.stringify(this.dataset, null, 2);
  }

  _downloadFile() {
    ui.notifications.info(game.i18n.localize('BTFG.Exporter.ExportFinished'));

    saveDataToFile(this._getStringifiedDataset(), 'text/json', `${this.pack.metadata.id}.json`);
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

      const module = await fetch(`${MODULE_TPL_BASE_URI}/module.json`);
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
    SceneNavigation.displayProgressBar({ label: this.progressMessage, pct: 1 });
  }

  _stepProgressBar() {
    ++this.progressNbImported;

    SceneNavigation.displayProgressBar({
      label: this.progressMessage,
      pct: Math.floor(this.progressNbImported * 100 / this.progressTotalElements),
    });
  }

  _endProgressBar() {
    SceneNavigation.displayProgressBar({ label: this.progressMessage, pct: 100 });
  }

  _getExportKey(document) {
    return this.options.useIdAsKey ? document._id : document.name;
  }
}

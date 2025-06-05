import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';

const { api, ux } = foundry.applications;

export class CompendiumExporterApp extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  defaultExportOptions = {
    sortEntries: false,
    useIdAsKey: false,
    generateModule: false,
    translationLocale: 'en',
    customMapping: {
      actor: {},
      item: {},
    },
  };
  packId = null;
  selectedFile = null;
  #dragDrop;

  constructor(options = {}) {
    super(options);

    this.object = {};
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: [BTFG.MODULE_ID, 'compendium-exporter-app'],
    window: {
      title: 'BTFG.CompendiumExporter.Title',
      resizable: true,
      contentClasses: ['inner-wrapper', 'standard-form'],
    },
    position: {
      width: 800,
      height: 600,
    },
    actions: {
      addMapping: this.#onAddMapping,
      exportMapping: this.#onExportMapping,
      importMapping: this.#onImportMapping,
      removeMapping: this.#onRemoveMapping,
      export: this.#onExport,
      cancel: this.#onCancel,
      unselectFile: this.#onUnselectFile,
    },
    tag: 'form',
    form: {
      handler: this.#formHandler,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    dragDrop: [{ dragSelector: null, dropSelector: '.drop-zone' }],
  };

  static PARTS = {
    main: {
      template: `modules/${BTFG.MODULE_ID}/templates/compendium-exporter.html.hbs`,
      templates: [
        `modules/${BTFG.MODULE_ID}/templates/_choose.html.hbs`,
        `modules/${BTFG.MODULE_ID}/templates/_export.html.hbs`,
        `modules/${BTFG.MODULE_ID}/templates/_default-mapping.html.hbs`,
      ],
    },
  };

  // static TABS = {
  //   sheet: {
  //     tabs: [
  //       { id: 'jokers', group: 'sheet', label: 'HEIST.HeistSheet.Jokers.Title' },
  //       { id: 'agency', group: 'sheet', label: 'HEIST.HeistSheet.TheAgency' },
  //       { id: 'reconnaissance', group: 'sheet', label: 'HEIST.GamePhases.Phase2.Title' },
  //       { id: 'planning', group: 'sheet', label: 'HEIST.GamePhases.Phase3.Title' },
  //       { id: 'progression', group: 'sheet', label: 'HEIST.GamePhases.Phase5.Title' },
  //     ],
  //     initial: 'agency',
  //   },
  // };

  // static get defaultOptions() {
  //   return foundry.utils.mergeObject(super.defaultOptions, {
  //     id: 'compendium-exporter', // @todo Useless ?
  //     tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'actor' }], // @todo À refaire
  //   });
  // }

  selectPack() {
    this.packId = null;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this.render(true);
  }

  exportPack(packId) {
    this.packId = packId;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this.#loadPackMapping();

    this.render(true);
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    if (this.packId) {
      context.pack = this.#getPack();
      context.actorMapping = 'Actor' === context.pack.metadata.type;
      context.adventureMapping = 'Adventure' === context.pack.metadata.type;
      context.itemMapping = 'Item' === context.pack.metadata.type;
      context.canCustomizeMapping = context.actorMapping || context.adventureMapping || context.itemMapping;
      context.selectedFileName = this.selectedFile?.name;
      context.object = this.object;
    }

    if (foundry.utils.isNewerVersion(game.version, 12)) {
      context.availableLocales = game.settings.settings.get('core.language').type.choices;
    } else {
      context.availableLocales = game.settings.settings.get('core.language').choices;
    }

    context.babeleActive = game?.babele?.initialized;

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  async _onSubmit(event, { updateData = null, preventClose = false, preventRender = false } = {}) {
    if (event.currentTarget?.files && event.currentTarget.files[0] && 'existingFile' === event.currentTarget.id) {
      this.selectedFile = event.currentTarget.files[0];

      await this.#loadFileMapping();
    }

    await super._onSubmit(event, { updateData, preventClose, preventRender });
  }

  _onDrop(e) {
    const data = ux.TextEditor.implementation.getDragEventData(e);

    if (!data || 'Compendium' !== data?.type) {
      ui.notifications.error(game.i18n.localize('BTFG.CompendiumChooser.NotCompendium'));

      return;
    }

    this.exportPack(data.collection);
  }

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.callbacks = {
        drop: this._onDrop.bind(this),
      };

      return new ux.DragDrop.implementation(d);
    });
  }

  static async #formHandler(event, form, formData) {
    console.warn(event, form, formData);
  }

  static async #onAddMapping(e) {
    const { target: { dataset: { type } } } = e;

    this.#addCustomMappingEntry(type, { key: '', value: '' });

    await this.#savePackMapping();

    this.render();
  }

  static async #onRemoveMapping(e) {
    const { target: { dataset: { type, index } } } = e;

    delete this.object.customMapping[type][index];

    // Re-index
    const newMapping = {};
    const arrayMapping = Object.values(this.object.customMapping[type]);

    for (let i = 0; i < arrayMapping.length; i++) {
      newMapping[i] = arrayMapping[i];
    }

    this.object.customMapping[type] = newMapping;

    await this.#savePackMapping();

    this.render();
  }

  static async #onExportMapping() {
    const data = this.object.customMapping;
    const pack = this.#getPack();
    const filename = `custom-mapping-${pack.metadata.label}.json`;

    saveDataToFile(JSON.stringify(data, null, 2), 'text/json', filename);
  }

  static async #onImportMapping(html) {
    const input = html.find('#import-custom-mapping-input');
    input.off('change', this.#overrideCustomMapping.bind(this));
    input.on('change', this.#overrideCustomMapping.bind(this));

    input.click();
  }

  static async #onExport() {
    const pack = this.#getPack();
    if (null !== pack) {
      const exporter = ExporterInstanciator.createForPack(pack, this.object, this.selectedFile);

      await exporter.export();
    }
  }

  static async #onCancel() {
    this.packId = null;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this.render();
  }

  static async #onUnselectFile() {
    this.selectedFile = null;

    this.render();
  }

  async _updateObject(e, formData) {
    this.object = foundry.utils.mergeObject(this.object, foundry.utils.expandObject(formData));

    await this.#savePackMapping();

    this.render();
  }

  /**
   * @returns {foundry.documents.collections.CompendiumCollection|null}
   * @private
   */
  #getPack() {
    if (!this.packId) {
      ui.notifications.error(game.i18n.localize('BTFG.CompendiumExporter.NoCompendiumId'));

      return null;
    }

    const pack = game.packs.get(this.packId);
    if (!pack) {
      ui.notifications.error(game.i18n.format('BTFG.CompendiumExporter.CompendiumNotFound', {
        id: this.packId,
      }));

      return null;
    }

    return pack;
  }

  #loadPackMapping() {
    const packsMappings = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    this.object.customMapping = packsMappings[this.packId.replace('.', '-')] ?? {
      actor: {},
      item: {},
    };
  }

  async #savePackMapping() {
    const savedMapping = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    savedMapping[this.packId.replace('.', '-')] = this.object.customMapping;

    await game.settings.set(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING, savedMapping);
  }

  async #loadFileMapping() {
    try {
      const jsonString = await readTextFromFile(this.selectedFile);
      const json = JSON.parse(jsonString);

      if (!json?.mapping) {
        return;
      }

      if (json.mapping?.actors) {
        for (const [key, value] of Object.entries(json.mapping.actors)) {
          this.#addCustomMappingEntry('actor', { key, value });
        }
      }

      if (json.mapping?.items) {
        for (const [key, value] of Object.entries(json.mapping.items)) {
          this.#addCustomMappingEntry('item', { key, value });
        }
      }

      await this.#savePackMapping();

      this.render();
    } catch (err) {
      ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: this.selectedFile.name,
      }));

      console.error(err);
    }
  }

  #addCustomMappingEntry(type, entry) {
    this.object.customMapping[type][Object.keys(this.object.customMapping[type]).length] = entry;
  }

  async #overrideCustomMapping(e) {
    e.preventDefault();

    if (!e.currentTarget?.files || !e.currentTarget.files[0] || 'import-custom-mapping-input' !== e.currentTarget.id) {
      return;
    }

    const file = e.currentTarget.files[0];

    try {
      const jsonString = await readTextFromFile(file);
      const json = JSON.parse(jsonString);

      if (json?.actor) {
        for (const { key, value } of Object.values(json.actor)) {
          this.#addCustomMappingEntry('actor', { key, value });
        }
      }

      if (json?.item) {
        for (const { key, value } of Object.values(json.item)) {
          this.#addCustomMappingEntry('item', { key, value });
        }
      }

      await this.#savePackMapping();

      this.render();
    } catch (err) {
      ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: file.name,
      }));

      console.error(err);
    }
  }
}

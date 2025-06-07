import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';
import { CompendiumExporterDataModel } from './compendium-exporter-data-model.mjs';

const { api, ux } = foundry.applications;

export class CompendiumExporterApp extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  /** @type {?CompendiumExporterDataModel} */
  #object = null;
  #selectedFile = null;
  #dragDrop;

  constructor(options = {}) {
    super(options);

    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    id: 'compendium-exporter',
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
        'templates/generic/tab-navigation.hbs',
        `modules/${BTFG.MODULE_ID}/templates/_choose.html.hbs`,
        `modules/${BTFG.MODULE_ID}/templates/_export.html.hbs`,
        `modules/${BTFG.MODULE_ID}/templates/_default-mapping.html.hbs`,
      ],
    },
  };

  static TABS = {
    mapping: {
      tabs: [
        { id: 'actor', label: 'BTFG.CompendiumExporter.ActorMapping' },
        { id: 'item', label: 'BTFG.CompendiumExporter.ItemMapping' },
      ],
      initial: 'actor',
    },
  };

  selectPack() {
    this.#object = new CompendiumExporterDataModel();

    this.render(true);
  }

  exportPack(packId) {
    this.#object = new CompendiumExporterDataModel({
      packId,
    });

    this.#loadPackMapping();

    this.render(true);
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    if (this.#object?.packId) {
      context.pack = this.#getPack();
      context.actorMapping = 'Actor' === context.pack.metadata.type;
      context.adventureMapping = 'Adventure' === context.pack.metadata.type;
      context.itemMapping = 'Item' === context.pack.metadata.type;
      context.canCustomizeMapping = context.actorMapping || context.adventureMapping || context.itemMapping;
      context.selectedFileName = this.#selectedFile?.name;
      context.object = this.#object;
      context.fields = this.#object.schema.fields;
      context.rootId = this.id;

      if (context.adventureMapping) {
        context.tabs = this._prepareTabs('mapping');
      }
    }

    context.babeleActive = game?.babele?.initialized;

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    this.#dragDrop.forEach((d) => d.bind(this.element));
    this.element.querySelector('[data-import-mapping]')?.addEventListener('click', this.#onImportMapping.bind(this));
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
    const submitData = foundry.utils.expandObject(formData.object);
    this.#object.updateSource(submitData);

    if (event.target?.files && event.target.files[0] && 'existingFile' === event.target.id) {
      this.#selectedFile = event.target.files[0];

      await this.#loadFileMapping();
    }

    await this.#savePackMapping();

    this.render();
  }

  static async #onAddMapping(e, btn) {
    this.#object.addCustomMapping(btn.dataset.type);

    await this.#savePackMapping();

    this.render();
  }

  static async #onRemoveMapping(e, btn) {
    this.#object.removeCustomMapping(btn.dataset.type, btn.dataset.id);

    await this.#savePackMapping();

    this.render();
  }

  static async #onExportMapping() {
    const data = this.#object.customMapping;
    const pack = this.#getPack();
    const filename = `custom-mapping-${pack.metadata.label}.json`;

    foundry.utils.saveDataToFile(JSON.stringify(data, null, 2), 'text/json', filename);
  }

  static async #onExport() {
    const pack = this.#getPack();
    if (null !== pack) {
      const exporter = ExporterInstanciator.createForPack(pack, this.#object, this.#selectedFile);

      await exporter.export();
    }
  }

  static async #onCancel() {
    this.#object = null;

    this.render();
  }

  static async #onUnselectFile() {
    this.#selectedFile = null;

    this.render();
  }

  async #onImportMapping(e) {
    const input = e.target.form.querySelector('#import-custom-mapping-input');
    input.removeEventListener('change', this.#overrideCustomMapping.bind(this));
    input.addEventListener('change', this.#overrideCustomMapping.bind(this));

    input.click();
  }

  /**
   * @returns {CompendiumCollection|null}
   * @private
   */
  #getPack() {
    if (!this.#object?.packId) {
      ui.notifications.error(game.i18n.localize('BTFG.CompendiumExporter.NoCompendiumId'));

      return null;
    }

    const pack = game.packs.get(this.#object.packId);
    if (!pack) {
      ui.notifications.error(game.i18n.format('BTFG.CompendiumExporter.CompendiumNotFound', {
        id: this.#object.packId,
      }));

      return null;
    }

    return pack;
  }

  #loadPackMapping() {
    const packsMappings = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    this.#object.updateSource({
      customMapping: packsMappings[this.#object.packId.replace('.', '-')] ?? {
        actor: {},
        item: {},
      },
    });
  }

  async #savePackMapping() {
    const savedMapping = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    savedMapping[this.#object.packId.replace('.', '-')] = this.#object.customMapping.toJSON();

    await game.settings.set(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING, savedMapping);
  }

  async #loadFileMapping() {
    try {
      const jsonString = await foundry.utils.readTextFromFile(this.#selectedFile);
      const json = JSON.parse(jsonString);

      if (!json?.mapping) {
        return;
      }

      if (json.mapping?.actors) {
        for (const [key, value] of Object.entries(json.mapping.actors)) {
          this.#object.addCustomMapping('actor', { key, value });
        }
      }

      if (json.mapping?.items) {
        for (const [key, value] of Object.entries(json.mapping.items)) {
          this.#object.addCustomMapping('item', { key, value });
        }
      }
    } catch (err) {
      ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: this.#selectedFile.name,
      }));

      console.error(err);
    }
  }

  async #overrideCustomMapping(e) {
    e.preventDefault();

    if (!e.currentTarget?.files || !e.currentTarget.files[0] || 'import-custom-mapping-input' !== e.currentTarget.id) {
      return;
    }

    const file = e.currentTarget.files[0];

    try {
      const jsonString = await foundry.utils.readTextFromFile(file);
      const json = JSON.parse(jsonString);

      this.#object.updateSource({ customMapping: json });

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

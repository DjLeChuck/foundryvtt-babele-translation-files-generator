import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';

export class CompendiumExporterApp extends FormApplication {
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

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'compendium-exporter',
      title: game.i18n.localize('BTFG.CompendiumExporter.Title'),
      template: `modules/${BTFG.MODULE_ID}/templates/compendium-exporter.html.hbs`,
      classes: [BTFG.MODULE_ID, 'compendium-exporter-app'],
      width: 800,
      height: 600,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: false,
      dragDrop: [{ dragSelector: null, dropSelector: '.drop-zone' }],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'actor' }],
    });
  }

  constructor(object = {}, options = {}) {
    super(object, options);

    this.object = {};
  }

  selectPack() {
    this.packId = null;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this.render(true);
  }

  exportPack(packId) {
    this.packId = packId;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this._loadPackMapping();

    this.render(true);
  }

  getData(options = {}) {
    const context = super.getData(options);

    if (this.packId) {
      context.pack = this._getPack();
      context.actorMapping = 'Actor' === context.pack.metadata.type;
      context.adventureMapping = 'Adventure' === context.pack.metadata.type;
      context.itemMapping = 'Item' === context.pack.metadata.type;
      context.canCustomizeMapping = context.actorMapping || context.adventureMapping || context.itemMapping;
      context.selectedFileName = this.selectedFile?.name;
    }

    if (foundry.utils.isNewerVersion(game.version, 12)) {
      context.availableLocales = game.settings.settings.get('core.language').type.choices;
    } else {
      context.availableLocales = game.settings.settings.get('core.language').choices;
    }

    context.babeleActive = game?.babele?.initialized;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-add-mapping]').click(this._onAddMapping.bind(this));
    html.find('[data-export-mapping]').click(this._onExportMapping.bind(this));
    html.find('[data-import-mapping]').click((e) => this._onImportMapping(e, html));
    html.find('[data-remove-mapping]').click(this._onRemoveMapping.bind(this));
    html.find('[data-export]').click(this._onExport.bind(this));
    html.find('[data-cancel]').click(this._onCancelChoice.bind(this));
    html.find('[data-unselect-file]').click(this._onUnselectFile.bind(this));
  }

  async _onSubmit(event, { updateData = null, preventClose = false, preventRender = false } = {}) {
    if (event.currentTarget?.files && event.currentTarget.files[0] && 'existingFile' === event.currentTarget.id) {
      this.selectedFile = event.currentTarget.files[0];

      await this._loadFileMapping();
    }

    await super._onSubmit(event, { updateData, preventClose, preventRender });
  }

  _onDrop(e) {
    e.preventDefault();

    const data = TextEditor.getDragEventData(e);

    if (!data || 'Compendium' !== data?.type) {
      ui.notifications.error(game.i18n.localize('BTFG.CompendiumChooser.NotCompendium'));

      return;
    }

    this.exportPack(data.id);
  }

  async _onAddMapping(e) {
    e.preventDefault();

    const { currentTarget: { dataset: { addMapping: type } } } = e;

    this._addCustomMappingEntry(type, { key: '', value: '' });

    await this._savePackMapping();

    this.render();
  }

  async _onExportMapping(e) {
    e.preventDefault();

    const data = this.object.customMapping;
    const pack = this._getPack();
    const filename = `custom-mapping-${pack.metadata.label}.json`;

    saveDataToFile(JSON.stringify(data, null, 2), 'text/json', filename);
  }

  async _onImportMapping(e, html) {
    e.preventDefault();

    const input = html.find('#import-custom-mapping-input');
    input.off('change', this._overrideCustomMapping.bind(this));
    input.on('change', this._overrideCustomMapping.bind(this));

    input.click();
  }

  async _onRemoveMapping(e) {
    e.preventDefault();

    const { currentTarget: { dataset: { removeMapping: type, index } } } = e;

    delete this.object.customMapping[type][index];

    // Re-index
    const newMapping = {};
    const arrayMapping = Object.values(this.object.customMapping[type]);

    for (let i = 0; i < arrayMapping.length; i++) {
      newMapping[i] = arrayMapping[i];
    }

    this.object.customMapping[type] = newMapping;

    await this._savePackMapping();

    this.render();
  }

  async _onExport(e) {
    e.preventDefault();

    const pack = this._getPack();
    if (null !== pack) {
      const exporter = ExporterInstanciator.createForPack(pack, this.object, this.selectedFile);

      await exporter.export();
    }
  }

  _onCancelChoice(e) {
    e.preventDefault();

    this.packId = null;
    this.object = foundry.utils.duplicate(this.defaultExportOptions);

    this.render();
  }

  _onUnselectFile(e) {
    e.preventDefault();

    this.selectedFile = null;

    this.render();
  }

  async _updateObject(e, formData) {
    this.object = foundry.utils.mergeObject(this.object, foundry.utils.expandObject(formData));

    await this._savePackMapping();

    this.render();
  }

  /**
   * @returns {CompendiumCollection|null}
   * @private
   */
  _getPack() {
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

  _loadPackMapping() {
    const packsMappings = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    this.object.customMapping = packsMappings[this.packId.replace('.', '-')] ?? {
      actor: {},
      item: {},
    };
  }

  async _savePackMapping() {
    const savedMapping = game.settings.get(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING);
    savedMapping[this.packId.replace('.', '-')] = this.object.customMapping;

    await game.settings.set(BTFG.MODULE_ID, BTFG.PACK_MAPPING_SETTING, savedMapping);
  }

  async _loadFileMapping() {
    try {
      const jsonString = await readTextFromFile(this.selectedFile);
      const json = JSON.parse(jsonString);

      if (!json?.mapping) {
        return;
      }

      if (json.mapping?.actors) {
        for (const [key, value] of Object.entries(json.mapping.actors)) {
          this._addCustomMappingEntry('actor', { key, value });
        }
      }

      if (json.mapping?.items) {
        for (const [key, value] of Object.entries(json.mapping.items)) {
          this._addCustomMappingEntry('item', { key, value });
        }
      }

      await this._savePackMapping();

      this.render();
    } catch (err) {
      ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: this.selectedFile.name,
      }));

      console.error(err);
    }
  }

  _addCustomMappingEntry(type, entry) {
    this.object.customMapping[type][Object.keys(this.object.customMapping[type]).length] = entry;
  }

  async _overrideCustomMapping(e) {
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
          this._addCustomMappingEntry('actor', { key, value });
        }
      }

      if (json?.item) {
        for (const { key, value } of Object.values(json.item)) {
          this._addCustomMappingEntry('item', { key, value });
        }
      }

      await this._savePackMapping();

      this.render();
    } catch (err) {
      ui.notifications.error(game.i18n.format('BTFG.Errors.CanNotReadFile', {
        name: file.name,
      }));

      console.error(err);
    }
  }
}

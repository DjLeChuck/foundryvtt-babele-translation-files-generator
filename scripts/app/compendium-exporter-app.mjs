import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';

export class CompendiumExporterApp extends FormApplication {
  exportOptions = {
    sortEntries: false,
    customMapping: [],
  };
  packId = null;

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
    });
  }

  selectPack() {
    this.packId = null;

    this.render(true);
  }

  exportPack(packId) {
    this.packId = packId;

    this.render(true);
  }

  getData(options = {}) {
    const context = super.getData(options);

    if (this.packId) {
      context.pack = this._getPack();
    }

    context.babeleActive = game?.babele?.initialized;
    context.sortEntries = this.exportOptions.sortEntries;
    context.customMapping = this.exportOptions.customMapping;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-add-mapping]').click(this._onAddMapping.bind(this));
    html.find('[data-remove-mapping]').click(this._onRemoveMapping.bind(this));
    html.find('[data-export]').click(this._onExport.bind(this));
    html.find('[data-cancel]').click(this._onCancelChoice.bind(this));
  }

  _onDrop(e) {
    e.preventDefault();

    const data = TextEditor.getDragEventData(e);

    if (!data || 'Compendium' !== data?.type) {
      ui.notifications.error(game.i18n.localize('BTFG.CompendiumChooser.NotCompendium'));

      return;
    }

    this.packId = data.id;

    this.render();
  }

  _onAddMapping(e) {
    e.preventDefault();

    this.exportOptions.customMapping.push({ key: '', value: '' });

    this.render();
  }

  _onRemoveMapping(e) {
    e.preventDefault();

    const { currentTarget: { dataset: { removeMapping: index } } } = e;

    this.exportOptions.customMapping.splice(index, 1);

    this.render();
  }

  async _onExport(e) {
    e.preventDefault();
    const pack = this._getPack();
    if (null !== pack) {
      const exporter = ExporterInstanciator.createForPack(pack, this.exportOptions);

      await exporter.export();
    }
  }

  _onCancelChoice(e) {
    e.preventDefault();

    this.packId = null;

    this.render();
  }

  async _updateObject(e, formData) {
    this.exportOptions = foundry.utils.expandObject(formData);
    this.exportOptions.customMapping = Object.values(this.exportOptions.customMapping ?? []);

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
}

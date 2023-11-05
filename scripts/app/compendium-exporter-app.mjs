import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';

export class CompendiumExporterApp extends FormApplication {
  packId = null;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'compendium-exporter',
      title: game.i18n.localize('BTFG.CompendiumExporter.Title'),
      template: `modules/${BTFG.MODULE_ID}/templates/compendium-exporter.html.hbs`,
      classes: [BTFG.MODULE_ID, 'compendium-exporter-app'],
      width: 600,
      height: 400,
      dragDrop: [{ dragSelector: null, dropSelector: '.drop-zone' }],
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    if (this.packId) {
      context.pack = this._getPack();
    }

    context.babeleActive = game?.babele?.initialized;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

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

  _onCancelChoice(e) {
    e.preventDefault();

    this.packId = null;

    this.render();
  }

  async _updateObject(e, formData) {
    const pack = this._getPack();
    if (null !== pack) {
      const exporter = ExporterInstanciator.createForPack(pack, formData);

      await exporter.export();
    }

    return Promise.resolve(undefined);
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

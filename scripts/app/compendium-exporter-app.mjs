import * as BTFG from '../const.mjs';
import { ExporterInstanciator } from '../exporters/exporter-instanciator.mjs';

export class CompendiumExporterApp extends FormApplication {
  constructor(options = {}) {
    super(options);

    if (!options.packId) {
      ui.notifications.error('No compendium ID provided.');

      return;
    }

    this.pack = game.packs.get(options.packId);
    if (!this.pack) {
      ui.notifications.error(`No compendium with ID ${options.packId}.`);
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'compendium-exporter',
      title: 'Compendium exporter',
      template: `modules/${BTFG.MODULE_ID}/templates/compendium-exporter.html.hbs`,
      classes: [BTFG.MODULE_ID, 'compendium-exporter-app'],
      width: 600,
      height: 400,
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    context.pack = this.pack;

    return context;
  }

  async _updateObject(e, formData) {
    const exporter = ExporterInstanciator.createForPack(this.pack, formData);

    await exporter.export();

    return Promise.resolve(undefined);
  }
}

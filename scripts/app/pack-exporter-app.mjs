import * as BTFG from '../const.mjs';

export class PackExporterApp extends Application {
  constructor(options = {}) {
    super(options);

    if (!options.packId) {
      ui.notifications.error('No pack ID provided.');

      return;
    }

    this.pack = game.packs.get(options.packId);
    if (!this.pack) {
      ui.notifications.error(`No pack with ID ${options.packId}.`);
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'pack-exporter',
      title: 'Pack exporter',
      template: `modules/${BTFG.MODULE_ID}/templates/pack-exporter.html.hbs`,
      classes: [BTFG.MODULE_ID, 'pack-exporter-app'],
      width: 600,
      height: 400,
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    context.pack = this.pack;

    return context;
  }
}

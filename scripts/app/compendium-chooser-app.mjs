import * as BTFG from '../const.mjs';

export class CompendiumChooserApp extends Application {
  packId = null;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'compendium-chooser',
      title: 'Compendium Chooser',
      template: `modules/${BTFG.MODULE_ID}/templates/compendium-chooser.html.hbs`,
      classes: [BTFG.MODULE_ID, 'compendium-chooser-app'],
      width: 600,
      height: 400,
      dragDrop: [{ dragSelector: null, dropSelector: '.drop-zone' }],
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    if (this.packId) {
      context.pack = game.packs.get(this.packId);
    }

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-cancel]').click(this._onCancelChoice.bind(this));
    html.find('[data-process]').click(this._onProcessChoice.bind(this));
  }

  _onDrop(e) {
    e.preventDefault();

    const data = TextEditor.getDragEventData(e);

    if (!data || 'Compendium' !== data?.type) {
      ui.notifications.error('You can only drop a compendium.');

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

  _onProcessChoice(e) {
    e.preventDefault();

    // ...
  }
}

import '../scss/btfg.scss';

import { CompendiumExporterApp } from './app/compendium-exporter-app.mjs';
import { registerHandlebarsHelper } from './helpers/handlebars.mjs';
import { registerTemplates } from './helpers/templates.mjs';
import { registerSettings } from './helpers/settings.mjs';

Hooks.on('init', () => {
  console.log('BTFG | Initializing Module');

  registerHandlebarsHelper();
  registerTemplates();
  registerSettings();
});

Hooks.on('ready', () => {
  game.babeleFilesGenerator = {
    api: {
      compendiumExporter: new CompendiumExporterApp(),
    },
  };
});

Hooks.on('renderCompendium', (app, html) => {
  if (!game.user.isGM) {
    return;
  }

  html.closest('.app').find('.translate').remove();

  const openBtn = $(`<a class="translate" data-tooltip="${game.i18n.localize('BTFG.ExportCompendiumFile')}">
<i class="fas fa-download"></i>
</a>`);
  openBtn.on('click', (e) => {
    e.preventDefault();

    game.babeleFilesGenerator.api.compendiumExporter.exportPack(app.metadata.id);
  });

  const titleElement = html.closest('.app').find('.window-title');
  openBtn.insertAfter(titleElement);
});

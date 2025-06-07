import '../scss/btfg.scss';

import { CompendiumExporterApp } from './app/compendium-exporter-app.mjs';
import { registerHandlebarsHelper } from './helpers/handlebars.mjs';
import { registerSettings } from './helpers/settings.mjs';

Hooks.on('init', () => {
  console.log('BTFG | Initializing Module');

  registerHandlebarsHelper();
  registerSettings();
});

Hooks.on('ready', () => {
  game.babeleFilesGenerator = {
    api: {
      compendiumExporter: new CompendiumExporterApp(),
    },
  };
});

Hooks.on('getHeaderControlsCompendium', (compendium, controls) => {
  controls.push({
    icon: 'fas fa-download',
    label: 'BTFG.ExportCompendiumFile',
    onClick: () => game.babeleFilesGenerator.api.compendiumExporter.exportPack(
      compendium.options.collection.metadata.id,
    ),
  });
});

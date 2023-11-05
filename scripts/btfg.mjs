import { CompendiumExporterApp } from './app/compendium-exporter-app.mjs';
import { registerHandlebarsHelper } from './helpers/handlebars.mjs';
import { registerTemplates } from './helpers/templates.mjs';

Hooks.on('init', () => {
  console.log('BTFG | Initializing Module');

  registerHandlebarsHelper();
  registerTemplates();
});

Hooks.on('ready', () => {
  game.babeleFilesGenerator = {
    api: {
      compendiumExporter: new CompendiumExporterApp(),
    },
  };
});

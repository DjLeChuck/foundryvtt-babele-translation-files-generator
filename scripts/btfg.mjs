import { CompendiumChooserApp } from './app/compendium-chooser-app.mjs';

Hooks.on('ready', () => {
  game.babeleFilesGenerator = {
    api: {
      compendiumChooser: new CompendiumChooserApp(),
    },
  };
});

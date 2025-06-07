import { CustomMappingDataModel } from './custom-mapping-data-model.mjs';

export class CompendiumExporterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      packId: new fields.StringField(),
      sortEntries: new fields.BooleanField({
        label: 'BTFG.CompendiumExporter.SortEntriesAlpha',
      }),
      useIdAsKey: new fields.BooleanField({
        label: 'BTFG.CompendiumExporter.UseIdAsKey',
      }),
      generateModule: new fields.BooleanField({
        label: 'BTFG.CompendiumExporter.GenerateModule',
      }),
      translationLocale: new fields.StringField({
        label: 'BTFG.CompendiumExporter.TranslationLocale',
        initial: game.i18n.lang,
        choices: game.settings.settings.get('core.language').type.choices,
      }),
      customMapping: new fields.EmbeddedDataField(CustomMappingDataModel),
    };
  }

  addCustomMapping(type, data = {}) {
    this.updateSource({
      customMapping: {
        [type]: [...this.customMapping._source[type], {
          id: foundry.utils.randomID(),
          ...data,
        }],
      },
    });
  }

  removeCustomMapping(type, id) {
    this.updateSource({
      customMapping: {
        [type]: this.customMapping._source[type].filter(mapping => mapping.id !== id),
      },
    });
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class SceneExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {SceneData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name, navName } = indexDocument;
    const documentData = { name };

    if (navName) {
      documentData.navName = navName;
    }

    if (this._notEmpty(document.drawings)) {
      documentData.drawings = {};

      for (const { text } of document.drawings) {
        if (text?.length) {
          documentData.drawings[text] = text;
        }
      }
    }

    if (this._notEmpty(document.notes)) {
      documentData.notes = {};

      for (const { text } of document.notes) {
        if (text?.length) {
          documentData.notes[text] = text;
        }
      }
    }

    if (this._notEmpty(document.levels)) {
      documentData.levels = {};

      for (const { name } of document.levels) {
        documentData.levels[name] = name;
      }
    }

    if (this._notEmpty(document.regions)) {
      documentData.regions = {};

      for (const region of document.regions) {
        documentData.regions[name] = { name };

        if (this._notEmpty(region.behaviors)) {
          documentData.regions[name].behaviors = {};

          for (const behavior of region.behaviors) {
            documentData.regions[name].behaviors[behavior.name] = {
              name: behavior.name,
            };

            if (behavior.system.text) {
              documentData.regions[name].behaviors[behavior.name].text = behavior.system.text;
            }
          }
        }
      }
    }

    return documentData;
  }
}

import { AbstractExporter } from './abstract-exporter.mjs';

export class SceneExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {SceneData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name, navName } = indexDocument;
    const documentData = { name };

    this._addIfDefined(indexDocument, documentData, 'navName');

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
        if (this._notEmpty(text)) {
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

            this._addIfDefined(behavior, documentData.regions[name].behaviors[behavior.name], 'text', 'system.text');
          }
        }
      }
    }

    return documentData;
  }
}

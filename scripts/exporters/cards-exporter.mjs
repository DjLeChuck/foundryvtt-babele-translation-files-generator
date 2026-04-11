import { AbstractExporter } from './abstract-exporter.mjs';

/**
 * @method _getPackDocument {CardsData}
 */
export class CardsExporter extends AbstractExporter {
  /**
   * @param {Object} indexDocument
   * @param {CardsData} document
   */
  async getDocumentData(indexDocument, document) {
    const { name } = indexDocument;
    const documentData = { name };

    this._addIfDefined(indexDocument, documentData, 'description');

    if (this._notEmpty(document.cards)) {
      documentData.cards = {};

      for (const card of document.cards) {
        documentData.cards[card.name] = { name: card.name };

        this._addIfDefined(card, documentData.cards[card.name], 'description');
        this._addIfDefined(card, documentData.cards[card.name], 'back');
        this._addIfDefined(card, documentData.cards[card.name], 'faces');
      }
    }

    return documentData;
  }
}

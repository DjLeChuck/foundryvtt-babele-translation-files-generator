export class CustomMappingDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      actor: new fields.ArrayField(this.#customMappingSchema),
      item: new fields.ArrayField(this.#customMappingSchema),
    };
  }

  static get #customMappingSchema() {
    const fields = foundry.data.fields;

    return new fields.SchemaField({
      id: new fields.DocumentIdField(),
      key: new fields.StringField({ required: true }),
      value: new fields.StringField({ required: true }),
    });
  }
}

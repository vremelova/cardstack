const { snakeCase } = require('lodash');

module.exports = function rowToDocument(schemaModels, type, row) {
  let contentType = schemaModels.find(m => m.type === 'content-types' && m.id === type);
  let fields = contentType.relationships.fields.data.map(ref => schemaModels.find(m => m.type === ref.type && m.id === ref.id));
  let doc = {
    id: row.id,
    type,
    attributes: {},
    relationships: {}
  };
  for (let field of fields) {
    if(field.attributes['field-type'] === '@cardstack/core-types::belongs-to') {
      let relatedId = row[field.id];

      if (relatedId) {
        doc.relationships[snakeCase(field.id)] = {
          data: {
            id: relatedId,
            type: field.relationships['related-types'].data[0].id // TODO: This doesn't support polymorphic relationships
          }
        };
      }

    } else {
      doc.attributes[field.id] = convertValue(row[snakeCase(field.id)], field.attributes['field-type']);
    }
  }
  return doc;
};


// This doesn't need to do much yet because we only support the
// simplest types. But other types will need to do more here.
function convertValue(pgValue, fieldType) {
  switch(fieldType) {
  case '@cardstack/core-types::string':
  case '@cardstack/core-types::any':
  case '@cardstack/core-types::boolean':
  case '@cardstack/core-types::date':
  case '@cardstack/core-types::integer':
    return pgValue;
  }
}

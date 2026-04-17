export function resolveFieldDefinition({
  field,
  groupObject,
  item,
  projectPreferencesTypes,
  projectPreferencesFields,
  fieldsSchema,
}) {
  const groupName = groupObject?.group ?? "";

  const typeBySubtype = projectPreferencesTypes.find((x) => {
    if (!x.subtype) {
      return false;
    }
    const subtypes = Array.isArray(x.subtype) ? x.subtype : [x.subtype];
    return subtypes.includes(item?.Subtype);
  });

  const typeByType = projectPreferencesTypes.find((x) => {
    if (x.subtype) {
      return false;
    }
    const types = Array.isArray(x.type) ? x.type : [x.type];
    return types.includes(item?.Type);
  });

  const matchedType = typeBySubtype || typeByType;

  // 1) projectPreferencesTypes (highest priority)
  const fieldSchemaFromType =
    matchedType?.groups
      ?.find((x) => x.group === groupName)
      ?.fields.find((x) => x.field === field) || {};

  // 2) projectPreferencesFields (fallback/defaults)
  const fieldSchemaFromProjectFields =
    projectPreferencesFields.find((x) => x.field === field) || {};

  // 3) native fields (lowest fallback)
  const fieldSchemaFromNative = fieldsSchema[field] || {};

  return {
    ...fieldSchemaFromNative,
    ...fieldSchemaFromProjectFields,
    ...fieldSchemaFromType,
  };
}
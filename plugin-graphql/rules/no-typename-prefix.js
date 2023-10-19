const NO_TYPENAME_PREFIX = 'NO_TYPENAME_PREFIX';

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		docs: {
			category: 'Schema',
			description:
        'Enforces users to avoid using the type name in a field name while defining your schema.',
			recommended: true,
			url: 'https://the-guild.dev/graphql/eslint/rules/no-typename-prefix',
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            type User {
              userId: ID!
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            type User {
              id: ID!
            }
          `
				}
			]
		},
		messages: {
			[NO_TYPENAME_PREFIX]:
        'Field "{{ fieldName }}" starts with the name of the parent type "{{ typeName }}"'
		},
		schema: []
	},
	create(context) {
		return {
			'ObjectTypeDefinition, ObjectTypeExtension, InterfaceTypeDefinition, InterfaceTypeExtension': function (
				node
			) {
				const typeName = node.name.value;
				const lowerTypeName = typeName.toLowerCase();

				for (const field of node.fields || []) {
					const fieldName = field.name.value;

					if (fieldName.toLowerCase().startsWith(lowerTypeName)) {
						context.report({
							data: {
								fieldName,
								typeName
							},
							messageId: NO_TYPENAME_PREFIX,
							node: field.name,
							suggest: [
								{
									desc: `Remove \`${fieldName.slice(0, typeName.length)}\` prefix`,
									fix: fixer => fixer.replaceText(
										field.name,
										fieldName.replace(new RegExp(`^${typeName}`, 'i'), '')
									)
								}
							]
						});
					}
				}
			}
		};
	}
};

import { isScalarType, Kind } from 'graphql';
import { getNodeName, requireGraphQLSchemaFromContext } from '../utils.js';

const RULE_ID = 'no-scalar-result-type-on-mutation';

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		docs: {
			category: 'Schema',
			description:
        'Avoid scalar result type on mutation type to make sure to return a valid state.',
			url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
			requiresSchema: true,
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            type Mutation {
              createUser: Boolean
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            type Mutation {
              createUser: User!
            }
          `
				}
			]
		},
		schema: []
	},
	create(context) {
		const schema = requireGraphQLSchemaFromContext(RULE_ID, context);
		const mutationType = schema.getMutationType();
		if (!mutationType) {
			return {};
		}
		const selector = [
			`:matches(ObjectTypeDefinition, ObjectTypeExtension)[name.value=${mutationType.name}]`,
			'> FieldDefinition > .gqlType Name'
		].join(' ');

		return {
			[selector](node) {
				const typeName = node.value;
				const graphQLType = schema.getType(typeName);
				if (isScalarType(graphQLType)) {
					let fieldDef = node.parent;
					while (fieldDef.kind !== Kind.FIELD_DEFINITION) {
						fieldDef = fieldDef.parent;
					}

					context.report({
						node,
						message: `Unexpected scalar result type \`${typeName}\` for ${getNodeName(fieldDef)}`,
						suggest: [
							{
								desc: `Remove \`${typeName}\``,
								fix: fixer => fixer.remove(node)
							}
						]
					});
				}
			}
		};
	}
};

import { isObjectType } from 'graphql';
import { getTypeName, requireGraphQLSchemaFromContext } from '../utils.js';

const RULE_ID = 'require-field-of-type-query-in-mutation-result';

export default {
	meta: {
		type: 'suggestion',
		docs: {
			category: 'Schema',
			description:
        'Allow the client in one round-trip not only to call mutation but also to get a wagon of data to update their application.\n> Currently, no errors are reported for result type `union`, `interface` and `scalar`.',
			url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
			requiresSchema: true,
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            type User { ... }

            type Mutation {
              createUser: User!
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            type User { ... }

            type Query { ... }

            type CreateUserPayload {
              user: User!
              query: Query!
            }

            type Mutation {
              createUser: CreateUserPayload!
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
		const queryType = schema.getQueryType();

		if (!mutationType || !queryType) {
			return {};
		}
		const selector = `:matches(ObjectTypeDefinition, ObjectTypeExtension)[name.value=${mutationType.name}] > FieldDefinition > .gqlType Name`;

		return {
			[selector](node) {
				const typeName = node.value;
				const graphQLType = schema.getType(typeName);

				if (isObjectType(graphQLType)) {
					const { fields } = graphQLType.astNode;
					const hasQueryType = fields?.some(field => getTypeName(field) === queryType.name);
					if (!hasQueryType) {
						context.report({
							node,
							message: `Mutation result type "${graphQLType.name}" must contain field of type "${queryType.name}"`
						});
					}
				}
			}
		};
	}
};

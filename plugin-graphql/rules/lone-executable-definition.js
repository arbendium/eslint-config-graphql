import { ARRAY_DEFAULT_OPTIONS, getLocation, pascalCase } from '../utils.js';

const RULE_ID = 'lone-executable-definition';

const definitionTypes = ['fragment', 'query', 'mutation', 'subscription'];

const schema = {
	type: 'array',
	maxItems: 1,
	items: {
		type: 'object',
		minProperties: 1,
		additionalProperties: false,
		properties: {
			ignore: {
				...ARRAY_DEFAULT_OPTIONS,
				maxItems: 3, // ignore all 4 types is redundant
				items: {
					enum: definitionTypes
				},
				description: 'Allow certain definitions to be placed alongside others.'
			}
		}
	}
};

export default {
	meta: {
		type: 'suggestion',
		docs: {
			category: 'Operations',
			description:
        'Require queries, mutations, subscriptions or fragments to be located in separate files.',
			url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            query Foo {
              id
            }
            fragment Bar on Baz {
              id
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            query Foo {
              id
            }
          `
				}
			]
		},
		messages: {
			[RULE_ID]: '{{name}} should be in a separate file.'
		},
		schema
	},
	create(context) {
		const ignore = new Set(context.options[0]?.ignore || []);
		const definitions = [];

		return {
			':matches(OperationDefinition, FragmentDefinition)': function (node) {
				const type = 'operation' in node ? node.operation : 'fragment';
				if (!ignore.has(type)) {
					definitions.push({ type, node });
				}
			},
			'Document:exit': function () {
				for (const { node, type } of definitions.slice(1) /* ignore first definition */) {
					let name = pascalCase(type);
					const definitionName = node.name?.value;
					if (definitionName) {
						name += ` "${definitionName}"`;
					}
					context.report({
						loc: node.name?.loc || getLocation(node.loc.start, type),
						messageId: RULE_ID,
						data: { name }
					});
				}
			}
		};
	}
};

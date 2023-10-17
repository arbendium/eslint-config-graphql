import { Kind } from 'graphql';
import { getNodeName } from '../utils.js';

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		docs: {
			url: 'https://the-guild.dev/graphql/eslint/rules/no-case-insensitive-enum-values-duplicates',
			category: 'Schema',
			recommended: true,
			description: 'Disallow case-insensitive enum values duplicates.',
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            enum MyEnum {
              Value
              VALUE
              ValuE
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            enum MyEnum {
              Value1
              Value2
              Value3
            }
          `
				}
			]
		},
		schema: []
	},
	create(context) {
		const selector = [Kind.ENUM_TYPE_DEFINITION, Kind.ENUM_TYPE_EXTENSION].join(',');

		return {
			[selector](node) {
				const duplicates = node.values?.filter(
					// eslint-disable-next-line max-len
					(item, index, array) => array.findIndex(v => v.name.value.toLowerCase() === item.name.value.toLowerCase())
            !== index
				);
				for (const duplicate of duplicates || []) {
					const enumName = duplicate.name.value;
					context.report({
						node: duplicate.name,
						message: `Unexpected case-insensitive enum values duplicates for ${getNodeName(
							duplicate
						)}`,
						suggest: [
							{
								desc: `Remove \`${enumName}\` enum value`,
								fix: fixer => fixer.remove(duplicate)
							}
						]
					});
				}
			}
		};
	}
};

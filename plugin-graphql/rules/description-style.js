import { getNodeName } from '../utils.js';

const schema = {
	type: 'array',
	maxItems: 1,
	items: {
		type: 'object',
		additionalProperties: false,
		minProperties: 1,
		properties: {
			style: {
				enum: ['block', 'inline'],
				default: 'block'
			}
		}
	}
};

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		docs: {
			examples: [
				{
					title: 'Incorrect',
					usage: [{ style: 'inline' }],
					code: (
					/* GraphQL */
						`
            """ Description """
            type someTypeName {
              # ...
            }
          `
					)
				},
				{
					title: 'Correct',
					usage: [{ style: 'inline' }],
					code: (
					/* GraphQL */
						`
            " Description "
            type someTypeName {
              # ...
            }
          `
					)
				}
			],
			description: 'Require all comments to follow the same style (either block or inline).',
			category: 'Schema',
			url: 'https://the-guild.dev/graphql/eslint/rules/description-style',
			recommended: true
		},
		schema
	},
	create(context) {
		const { style = 'block' } = context.options[0] || {};
		const isBlock = style === 'block';

		return {
			[`.description[type=StringValue][block!=${isBlock}]`](node) {
				context.report({
					loc: isBlock ? node.loc : node.loc.start,
					message: `Unexpected ${isBlock ? 'inline' : 'block'} description for ${getNodeName(
						node.parent
					)}`,
					suggest: [
						{
							desc: `Change to ${isBlock ? 'block' : 'inline'} style description`,
							fix(fixer) {
								const sourceCode = context.getSourceCode();
								const originalText = sourceCode.getText(node);
								const newText = isBlock ? originalText.replace(/(^")|("$)/g, '"""') : originalText.replace(/(^""")|("""$)/g, '"').replace(/\s+/g, ' ');

								return fixer.replaceText(node, newText);
							}
						}
					]
				});
			}
		};
	}
};

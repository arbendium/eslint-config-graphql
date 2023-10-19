import { Kind } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { ARRAY_DEFAULT_OPTIONS, logger, requireSiblingsOperations } from '../utils.js';

const RULE_ID = 'selection-set-depth';

const schema = {
	type: 'array',
	minItems: 1,
	maxItems: 1,
	items: {
		type: 'object',
		additionalProperties: false,
		required: ['maxDepth'],
		properties: {
			maxDepth: {
				type: 'number'
			},
			ignore: ARRAY_DEFAULT_OPTIONS
		}
	}
};

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		docs: {
			category: 'Operations',
			description:
        'Limit the complexity of the GraphQL operations solely by their depth. Based on [graphql-depth-limit](https://npmjs.com/package/graphql-depth-limit).',
			url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
			requiresSiblings: true,
			examples: [
				{
					title: 'Incorrect',
					usage: [{ maxDepth: 1 }],
					code: `
            query deep2 {
              viewer { # Level 0
                albums { # Level 1
                  title # Level 2
                }
              }
            }
          `
				},
				{
					title: 'Correct',
					usage: [{ maxDepth: 4 }],
					code: `
            query deep2 {
              viewer { # Level 0
                albums { # Level 1
                  title # Level 2
                }
              }
            }
          `
				},
				{
					title: 'Correct (ignored field)',
					usage: [{ maxDepth: 1, ignore: ['albums'] }],
					code: `
            query deep2 {
              viewer { # Level 0
                albums { # Level 1
                  title # Level 2
                }
              }
            }
          `
				}
			],
			recommended: true,
			configOptions: [{ maxDepth: 7 }]
		},
		schema
	},
	create(context) {
		let siblings = null;

		try {
			siblings = requireSiblingsOperations(RULE_ID, context);
		} catch {
			logger.warn(
				`Rule "${RULE_ID}" works best with siblings operations loaded. For more info: https://bit.ly/graphql-eslint-operations`
			);
		}

		const { maxDepth, ignore = [] } = context.options[0];
		const checkFn = depthLimit(maxDepth, { ignore });

		return {
			'OperationDefinition, FragmentDefinition': function (node) {
				try {
					const rawNode = node.rawNode();
					const fragmentsInUse = siblings ? siblings.getFragmentsInUse(rawNode) : [];
					const document = {
						kind: Kind.DOCUMENT,
						definitions: [rawNode, ...fragmentsInUse]
					};

					checkFn({
						getDocument: () => document,
						reportError(error) {
							const { line, column } = error.locations[0];

							const ancestors = context.getAncestors();
							const token = ancestors[0].tokens.find(
								token => token.loc.start.line === line && token.loc.start.column === column - 1
							);

							context.report({
								loc: {
									line,
									column: column - 1
								},
								message: error.message,
								// Don't provide suggestions for fragment that can be in a separate file
								...(token && {
									suggest: [
										{
											desc: 'Remove selections',
											fix(fixer) {
												const sourceCode = context.getSourceCode();
												const foundNode = sourceCode.getNodeByRangeIndex(token.range[0]);
												const parentNode = foundNode.parent.parent;

												return fixer.remove(
													foundNode.kind === 'Name' ? parentNode.parent : parentNode
												);
											}
										}
									]
								})
							});
						}
					});
				} catch (e) {
					logger.warn(
						`Rule "${RULE_ID}" check failed due to a missing siblings operations. For more info: https://bit.ly/graphql-eslint-operations`,
						e
					);
				}
			}
		};
	}
};

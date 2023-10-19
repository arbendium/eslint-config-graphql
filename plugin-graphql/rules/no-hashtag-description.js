import { TokenKind } from 'graphql';
import { getNodeName } from '../utils.js';

const RULE_ID = 'HASHTAG_COMMENT';

export default {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,
		schema: [],
		messages: {
			[RULE_ID]:
        'Unexpected GraphQL descriptions as hashtag `#` for {{ nodeName }}.\nPrefer using `"""` for multiline, or `"` for a single line description.'
		},
		docs: {
			description:
        'Requires to use `"""` or `"` for adding a GraphQL description instead of `#`.\nAllows to use hashtag for comments, as long as it\'s not attached to an AST definition.',
			category: 'Schema',
			url: 'https://the-guild.dev/graphql/eslint/rules/no-hashtag-description',
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            # Represents a user
            type User {
              id: ID!
              name: String
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            " Represents a user "
            type User {
              id: ID!
              name: String
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            # This file defines the basic User type.
            # This comment is valid because it's not attached specifically to an AST object.

            " Represents a user "
            type User {
              id: ID! # This one is also valid, since it comes after the AST object
              name: String
            }
          `
				}
			],
			recommended: true
		}
	},
	create(context) {
		const selector = 'Document[definitions.0.kind!=/^(OperationDefinition|FragmentDefinition)$/]';

		return {
			[selector](node) {
				const rawNode = node.rawNode();
				let token = rawNode.loc.startToken;

				while (token) {
					const {
						kind, prev, next, value, line, column
					} = token;

					if (kind === TokenKind.COMMENT && prev && next) {
						const isEslintComment = value.trimStart().startsWith('eslint');
						const linesAfter = next.line - line;
						if (
							!isEslintComment
              && line !== prev.line
              && next.kind === TokenKind.NAME
              && linesAfter < 2
						) {
							const sourceCode = context.getSourceCode();
							const { tokens } = sourceCode.ast;

							const t = tokens.find(
								// eslint-disable-next-line max-len
								token => token.loc.start.line === next.line && token.loc.start.column === next.column - 1
							);
							const nextNode = sourceCode.getNodeByRangeIndex(t.range[1] + 1);

							context.report({
								messageId: RULE_ID,
								data: {
									nodeName: getNodeName(
										'name' in nextNode ? nextNode : nextNode.parent
									)
								},
								loc: {
									line,
									column: column - 1
								},
								// eslint-disable-next-line no-loop-func
								suggest: ['"""', '"'].map(descriptionSyntax => ({
									desc: `Replace with \`${descriptionSyntax}\` description syntax`,
									fix: fixer => fixer.replaceTextRange(
										[token.start, token.end],
										[descriptionSyntax, value.trim(), descriptionSyntax].join('')
									)
								}))
							});
						}
					}

					if (!next) {
						break;
					}

					token = next;
				}
			}
		};
	}
};

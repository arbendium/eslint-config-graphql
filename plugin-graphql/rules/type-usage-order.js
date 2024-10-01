import { Kind, visit } from 'graphql';

const RULE_ID = 'type-usage-order';

function getTypeDependencies(node) {
	const fieldTypes = new Set();

	visit(node.rawNode(), {
		NamedType(node) {
			fieldTypes.add(node.name.value);
		}
	});

	return [...fieldTypes];
}

export default {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		docs: {
			category: ['Schema'],
			description: 'Enforce arrange type definitions in order of ther usage.',
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
						type User {
							username: String
							password: String
						}

						type Query {
							me: User
						}
					`
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
						type Query {
							me: User
						}

						type User {
							username: String
							password: String
						}
					`
				},
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
						type Query {
							me: User

						}

						scalar Language

						type User {
							username: String
							password: String
							language: Language
						}
					`
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
						type Query {
							me: User
						}

						type User {
							username: String
							password: String
							language: Language
						}

						scalar Language
					`
				},
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
						type Query {
							me: User
							status: Status
						}

						type User {
							username: String
							password: String
							language: Language
						}

						type Status {
							up: Boolean
						}

						scalar Language
					`
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
						type Query {
							me: User
							status: Status
						}

						type User {
							username: String
							password: String
							language: Language
						}

						scalar Language

						type Status {
							up: Boolean
						}
					`
				}
			]
		},
		messages: {
			[RULE_ID]: '{{ currNode }} should be before {{ prevNode }}'
		}
	},
	create(context) {
		const sourceCode = context.getSourceCode();

		function isNodeAndCommentOnSameLine(node, comment) {
			return node.loc.end.line === comment.loc.start.line;
		}

		function getBeforeComments(node) {
			const commentsBefore = sourceCode.getCommentsBefore(node);
			if (commentsBefore.length === 0) {
				return [];
			}
			const tokenBefore = sourceCode.getTokenBefore(node);
			if (tokenBefore) {
				return commentsBefore.filter(comment => !isNodeAndCommentOnSameLine(tokenBefore, comment));
			}
			const filteredComments = [];
			const nodeLine = node.loc.start.line;
			// Break on comment that not attached to node
			for (let i = commentsBefore.length - 1; i >= 0; i -= 1) {
				const comment = commentsBefore[i];
				if (nodeLine - comment.loc.start.line - filteredComments.length > 1) {
					break;
				}
				filteredComments.unshift(comment);
			}

			return filteredComments;
		}

		function getRangeWithComments(node) {
			if (node.kind === Kind.VARIABLE) {
				node = node.parent;
			}
			const [firstBeforeComment] = getBeforeComments(node);
			const [firstAfterComment] = sourceCode.getCommentsAfter(node);
			const from = firstBeforeComment || node;
			const to = firstAfterComment && isNodeAndCommentOnSameLine(node, firstAfterComment)
				? firstAfterComment
				: node;

			return [from.range[0], to.range[1]];
		}

		function reportReorder(node, otherNode) {
			context.report({
				node: node.name,
				messageId: RULE_ID,
				data: {
					currNode: node.name.value,
					prevNode: otherNode.name.value
				},
				* fix(fixer) {
					const prevRange = getRangeWithComments(otherNode);
					const currRange = getRangeWithComments(node);
					yield fixer.replaceTextRange(
						prevRange,
						sourceCode.getText({ range: currRange })
					);
					yield fixer.replaceTextRange(
						currRange,
						sourceCode.getText({ range: prevRange })
					);
				}
			});
		}

		const usedTypes = [];
		const unusedTypes = {};
		const nodes = {};
		let mutation;
		let subscription;

		return {
			'[kind=/.+TypeDefinition/]': node => {
				const typeName = node.name.value;
				const typeIndex = usedTypes.indexOf(typeName);

				switch (typeName) {
				case 'Query':
					if (mutation || subscription) {
						reportReorder(node, mutation ?? subscription);
					}

					break;
				case 'Mutation':
					mutation = node;
					if (subscription) {
						reportReorder(node, subscription);
					}

					break;
				case 'Subscription':
					subscription = node;

					break;
				default:
					if (typeIndex === -1) {
						unusedTypes[typeName] = true;
					}
				}

				const additionalFieldTypes = getTypeDependencies(node)
					.filter(type => typeName !== type && !usedTypes.includes(type));

				additionalFieldTypes.forEach(type => {
					if (typeName !== type && unusedTypes[type]) {
						reportReorder(node, nodes[type]);

						delete unusedTypes[type];
					}
				});

				nodes[typeName] = node;

				if (typeIndex === -1) {
					usedTypes.push(...additionalFieldTypes);
				} else {
					for (let i = typeIndex + 1; i < usedTypes.length; i++) {
						if (nodes[usedTypes[i]] != null) {
							reportReorder(node, nodes[usedTypes[i]]);

							break;
						}
					}

					usedTypes.splice(
						typeIndex + 1,
						0,
						...additionalFieldTypes
					);
				}
			},
			DirectiveDefinition(node) {
				const dependencies = getTypeDependencies(node);

				usedTypes.push(...dependencies.filter(type => !usedTypes.includes(type)));
			}
		};
	}
};

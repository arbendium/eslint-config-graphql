import { relative } from 'path';
import { Kind } from 'graphql';
import {
	CWD, normalizePath, requireSiblingsOperations, VIRTUAL_DOCUMENT_REGEX
} from '../utils.js';

const RULE_ID = 'unique-operation-name';

function checkNode(context, node, ruleId) {
	const documentName = node.name.value;
	const siblings = requireSiblingsOperations(ruleId, context);
	const siblingDocuments = node.kind === Kind.FRAGMENT_DEFINITION
		? siblings.getFragment(documentName)
		: siblings.getOperation(documentName);
	const filepath = context.getFilename();

	const conflictingDocuments = siblingDocuments.filter(f => {
		const isSameName = f.document.name?.value === documentName;
		const isSamePath = normalizePath(f.filePath) === normalizePath(filepath);

		return isSameName && !isSamePath;
	});

	if (conflictingDocuments.length > 0) {
		context.report({
			messageId: ruleId,
			data: {
				documentName,
				summary: conflictingDocuments
					.map(f => `\t${relative(CWD, f.filePath.replace(VIRTUAL_DOCUMENT_REGEX, ''))}`)
					.join('\n')
			},
			node: node.name
		});
	}
}

export default {
	meta: {
		type: 'suggestion',
		docs: {
			category: 'Operations',
			description: 'Enforce unique operation names across your project.',
			url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
			requiresSiblings: true,
			examples: [
				{
					title: 'Incorrect',
					code: /* GraphQL */ `
            # foo.query.graphql
            query user {
              user {
                id
              }
            }

            # bar.query.graphql
            query user {
              me {
                id
              }
            }
          `
				},
				{
					title: 'Correct',
					code: /* GraphQL */ `
            # foo.query.graphql
            query user {
              user {
                id
              }
            }

            # bar.query.graphql
            query me {
              me {
                id
              }
            }
          `
				}
			]
		},
		messages: {
			[RULE_ID]: 'Operation named "{{ documentName }}" already defined in:\n{{ summary }}'
		},
		schema: []
	},
	create(context) {
		return {
			'OperationDefinition[name!=undefined]': function (node) {
				checkNode(context, node, RULE_ID);
			}
		};
	}
};

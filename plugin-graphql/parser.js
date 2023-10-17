import { parseGraphQLSDL } from '@graphql-tools/utils';
import { buildSchema, GraphQLError } from 'graphql';
import convertToESTree from './estree-converter/converter.js';
import { extractComments, extractTokens } from './estree-converter/utils.js';
import { loadGraphQLConfig } from './graphql-config.js';
import getSchema from './schema.js';
import getSiblings from './siblings.js';
import { VIRTUAL_DOCUMENT_REGEX } from './utils.js';

export default function parseForESLint(code, options) {
	try {
		const { filePath } = options;

		if (options.documents == null) {
			options.documents = options.operations;
		}

		const { document } = parseGraphQLSDL(filePath, code, {
			...options.graphQLParserOptions,
			noLocation: false
		});

		const gqlConfig = loadGraphQLConfig(options);
		const realFilepath = filePath.replace(VIRTUAL_DOCUMENT_REGEX, '');
		const project = gqlConfig.getProjectForFile(realFilepath);
		let schema = null;

		try {
			// eslint-disable-next-line no-nested-ternary
			schema = project
				? getSchema(project, options.schemaOptions)
				: typeof options.schema === 'string' ? buildSchema(options.schema) : null;
		} catch (error) {
			if (error instanceof Error) {
				error.message = `Error while loading schema: ${error.message}`;
			}
			throw error;
		}

		const rootTree = convertToESTree(document, schema);

		return {
			services: {
				schema,
				siblingOperations: getSiblings(project, options.documents)
			},
			ast: {
				comments: extractComments(document.loc),
				tokens: extractTokens(filePath, code),
				loc: rootTree.loc,
				range: rootTree.range,
				type: 'Program',
				sourceType: 'script',
				body: [rootTree]
			}
		};
	} catch (error) {
		if (error instanceof Error) {
			error.message = `[graphql-eslint] ${error.message}`;
		}

		if (error instanceof GraphQLError) {
			const location = error.locations?.[0];
			const eslintError = {
				index: error.positions?.[0],
				...(location && {
					lineNumber: location.line,
					column: location.column - 1
				}),
				message: error.message
			};
			throw eslintError;
		}

		throw error;
	}
}

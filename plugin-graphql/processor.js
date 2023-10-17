import { relative } from 'path';
import { gqlPluckFromCodeStringSync } from '@graphql-tools/graphql-tag-pluck';
import { asArray } from '@graphql-tools/utils';
import { loadOnDiskGraphQLConfig } from './graphql-config.js';
import { CWD, REPORT_ON_FIRST_CHARACTER, truthy } from './utils.js';

const blocksMap = /* @__PURE__ */ new Map();
let onDiskConfig;
let onDiskConfigLoaded = false;
const RELEVANT_KEYWORDS = ['gql', 'graphql', 'GraphQL'];

export default {
	supportsAutofix: true,
	preprocess(code, filePath) {
		if (!onDiskConfigLoaded) {
			onDiskConfig = loadOnDiskGraphQLConfig(filePath);
			onDiskConfigLoaded = true;
		}

		let keywords = RELEVANT_KEYWORDS;

		const pluckConfig = onDiskConfig == null
			? undefined
			: onDiskConfig.getProjectForFile(filePath).extensions.pluckConfig;

		if (pluckConfig) {
			const {
				modules = [],
				globalGqlIdentifierName = ['gql', 'graphql'],
				gqlMagicComment = 'GraphQL'
			} = pluckConfig;

			keywords = [
				...new Set(
					[
						...modules.map(({ identifier }) => identifier),
						...asArray(globalGqlIdentifierName),
						gqlMagicComment
					].filter(truthy)
				)
			];
		}

		if (keywords.every(keyword => !code.includes(keyword))) {
			return [code];
		}

		try {
			const sources = gqlPluckFromCodeStringSync(filePath, code, {
				skipIndent: true,
				...pluckConfig
			});

			const blocks = sources.map(item => ({
				filename: 'document.graphql',
				text: item.body,
				lineOffset: item.locationOffset.line - 1,
				offset: item.locationOffset.index + 1
			}));

			blocksMap.set(filePath, blocks);

			return [
				...blocks,
				code
				/* source code must be provided and be last */
			];
		} catch (error) {
			if (error instanceof Error) {
				error.message = `[graphql-eslint] Error while preprocessing "${relative(
					CWD,
					filePath
				)}" file

${error.message}`;
			}

			// eslint-disable-next-line no-console
			console.error(error);

			return [code];
		}
	},
	postprocess(messages, filePath) {
		const blocks = blocksMap.get(filePath) || [];

		for (let i = 0; i < blocks.length; i += 1) {
			const { lineOffset, offset } = blocks[i];

			for (const message of messages[i] || []) {
				const isVueOrSvelte = /\.(vue|svelte)$/.test(filePath);

				if (isVueOrSvelte) {
					delete message.endLine;
					delete message.endColumn;
					delete message.fix;
					delete message.suggestions;
					Object.assign(message, REPORT_ON_FIRST_CHARACTER);

					continue;
				}

				message.line += lineOffset;

				if (typeof message.endLine === 'number') {
					message.endLine += lineOffset;
				}

				if (message.fix) {
					message.fix.range[0] += offset;
					message.fix.range[1] += offset;
				}

				for (const suggestion of message.suggestions || []) {
					const [start, end] = suggestion.fix.range;
					suggestion.fix.range = [start + offset, end + offset];
				}
			}
		}

		const result = messages.flat();

		return result.sort((a, b) => a.line - b.line || a.column - b.column);
	}
};

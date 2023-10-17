import { parseGraphQLSDL } from '@graphql-tools/utils';
import { Kind, visit } from 'graphql';
import getDocuments from './documents.js';
import { logger } from './utils.js';

const siblingOperationsCache = new Map();

export default function getSiblings(project, documents) {
	// eslint-disable-next-line no-nested-ternary
	const siblings = project
		? getDocuments(project)
		: typeof documents === 'string' ? [parseGraphQLSDL('operation.graphql', documents, { noLocation: true })] : [];

	if (siblings.length === 0) {
		let printed = false;
		const noopWarn = () => {
			if (!printed) {
				logger.warn(
					'getSiblingOperations was called without any operations. Make sure to set "parserOptions.operations" to make this feature available!'
				);
				printed = true;
			}

			return [];
		};

		return {
			available: false,
			getFragment: noopWarn,
			getFragments: noopWarn,
			getFragmentByType: noopWarn,
			getFragmentsInUse: noopWarn,
			getOperation: noopWarn,
			getOperations: noopWarn,
			getOperationByType: noopWarn
		};
	}

	const value = siblingOperationsCache.get(siblings);

	if (value) {
		return value;
	}

	let fragmentsCache = null;

	const getFragments = () => {
		if (fragmentsCache === null) {
			const result = [];
			for (const source of siblings) {
				for (const definition of source.document?.definitions || []) {
					if (definition.kind === Kind.FRAGMENT_DEFINITION) {
						result.push({
							filePath: source.location,
							document: definition
						});
					}
				}
			}

			fragmentsCache = result;
		}

		return fragmentsCache;
	};

	let cachedOperations = null;

	const getOperations = () => {
		if (cachedOperations === null) {
			const result = [];

			for (const source of siblings) {
				for (const definition of source.document?.definitions || []) {
					if (definition.kind === Kind.OPERATION_DEFINITION) {
						result.push({
							filePath: source.location,
							document: definition
						});
					}
				}
			}

			cachedOperations = result;
		}

		return cachedOperations;
	};

	const getFragment = name => getFragments().filter(f => f.document.name.value === name);

	const collectFragments = (selectable, recursive, collected = /* @__PURE__ */ new Map()) => {
		visit(selectable, {
			FragmentSpread(spread) {
				const fragmentName = spread.name.value;
				const [fragment] = getFragment(fragmentName);
				if (!fragment) {
					logger.warn(
						`Unable to locate fragment named "${fragmentName}", please make sure it's loaded using "parserOptions.operations"`
					);

					return;
				}

				if (!collected.has(fragmentName)) {
					collected.set(fragmentName, fragment.document);
					if (recursive) {
						collectFragments(fragment.document, recursive, collected);
					}
				}
			}
		});

		return collected;
	};

	const siblingOperations = {
		available: true,
		getFragment,
		getFragments,
		getFragmentByType(typeName) {
			return getFragments().filter(f => f.document.typeCondition.name.value === typeName);
		},
		getFragmentsInUse(selectable, recursive = true) {
			return Array.from(collectFragments(selectable, recursive).values());
		},
		getOperation: name => getOperations().filter(o => o.document.name?.value === name),
		getOperations,
		getOperationByType: type => getOperations().filter(o => o.document.operation === type)
	};

	siblingOperationsCache.set(siblings, siblingOperations);

	return siblingOperations;
}

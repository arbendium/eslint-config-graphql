import { resolve } from 'path';
import ModuleCache from './cache.js';

const operationsCache = new ModuleCache();

const handleVirtualPath = documents => {
	const filepathMap = Object.create(null);

	return documents.map(source => {
		const { location } = source;

		if (['.gql', '.graphql'].some(extension => location.endsWith(extension))) {
			return source;
		}

		if (filepathMap[location] == null) {
			filepathMap[location] = 0;
		} else {
			filepathMap[location]++;
		}

		const index = filepathMap[location];

		return {
			...source,
			location: resolve(location, `${index}_document.graphql`)
		};
	});
};

export default function getDocuments(project) {
	const documentsKey = project.documents;

	if (!documentsKey) {
		return [];
	}

	let siblings = operationsCache.get(documentsKey);

	if (!siblings) {
		const documents = project.loadDocumentsSync(project.documents, {
			skipGraphQLImport: true,
			pluckConfig: project.extensions.pluckConfig
		});

		siblings = handleVirtualPath(documents);
		operationsCache.set(documentsKey, siblings);
	}

	return siblings;
}

import ModuleCache from './cache.js';

const schemaCache = new ModuleCache();

export default function getSchema(project, schemaOptions) {
	const schemaKey = project.schema;
	if (!schemaKey) {
		return null;
	}

	const cache = schemaCache.get(schemaKey);

	if (cache) {
		return cache;
	}

	const schema = project.loadSchemaSync(project.schema, 'GraphQLSchema', {
		...schemaOptions,
		pluckConfig: project.extensions.pluckConfig
	});

	schemaCache.set(schemaKey, schema);

	return schema;
}

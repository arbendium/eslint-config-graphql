import { dirname } from 'path';
import { CodeFileLoader } from '@graphql-tools/code-file-loader';
import { GraphQLConfig, loadConfigSync } from 'graphql-config';

let graphQLConfig;

export function loadOnDiskGraphQLConfig(filePath) {
	return loadConfigSync({
		// load config relative to the file being linted
		rootDir: dirname(filePath),
		throwOnEmpty: false,
		throwOnMissing: false,
		extensions: [codeFileLoaderExtension]
	});
}

export function loadGraphQLConfig(options) {
	if (graphQLConfig) {
		return graphQLConfig;
	}
	const onDiskConfig = !options.skipGraphQLConfig && loadOnDiskGraphQLConfig(options.filePath);

	const configOptions = options.projects ? { projects: options.projects } : {
		schema: options.schema || '',
		// if `schema` is `undefined` will throw error `Project 'default' not found`
		documents: options.documents,
		extensions: options.extensions,
		include: options.include,
		exclude: options.exclude
	};

	graphQLConfig = onDiskConfig || new GraphQLConfig(
		{
			config: configOptions,
			filepath: 'virtual-config'
		},
		[codeFileLoaderExtension]
	);

	return graphQLConfig;
}

function codeFileLoaderExtension(api) {
	const { schema, documents } = api.loaders;
	schema.register(new CodeFileLoader());
	documents.register(new CodeFileLoader());

	return { name: 'graphql-eslint-loaders' };
}

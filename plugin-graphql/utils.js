import { Kind } from 'graphql';
import lowerCase from 'lodash.lowercase';

function requireSiblingsOperations(ruleId, context) {
	const { siblingOperations } = context.parserServices;

	if (!siblingOperations.available) {
		throw new Error(
			`Rule \`${ruleId}\` requires \`parserOptions.operations\` to be set and loaded. See https://bit.ly/graphql-eslint-operations for more info`
		);
	}

	return siblingOperations;
}

function requireGraphQLSchemaFromContext(ruleId, context) {
	const { schema } = context.parserServices;

	if (!schema) {
		throw new Error(
			`Rule \`${ruleId}\` requires \`parserOptions.schema\` to be set and loaded. See https://bit.ly/graphql-eslint-schema for more info`
		);
	}

	return schema;
}

const chalk = {
	red: str => `\x1b[31m${str}\x1b[39m`,
	yellow: str => `\x1b[33m${str}\x1b[39m`
};

const logger = {
	error(...args) {
		// eslint-disable-next-line no-console
		console.error(chalk.red('error'), '[graphql-eslint]', ...args);
	},
	warn(...args) {
		// eslint-disable-next-line no-console
		console.warn(chalk.yellow('warning'), '[graphql-eslint]', ...args);
	}
};

const normalizePath = path => (path || '').replace(/\\/g, '/');

const VIRTUAL_DOCUMENT_REGEX = /\/\d+_document.graphql$/;

const CWD = process.cwd();

// eslint-disable-next-line no-nested-ternary
const getTypeName = node => 'type' in node ? getTypeName(node.type) : 'name' in node && node.name ? node.name.value : '';

const TYPES_KINDS = [
	Kind.OBJECT_TYPE_DEFINITION,
	Kind.INTERFACE_TYPE_DEFINITION,
	Kind.ENUM_TYPE_DEFINITION,
	Kind.SCALAR_TYPE_DEFINITION,
	Kind.INPUT_OBJECT_TYPE_DEFINITION,
	Kind.UNION_TYPE_DEFINITION
];

const pascalCase = str => lowerCase(str).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

const camelCase = str => {
	const result = pascalCase(str);

	return result.charAt(0).toLowerCase() + result.slice(1);
};

const convertCase = (style, str) => {
	switch (style) {
	case 'camelCase':
		return camelCase(str);
	case 'PascalCase':
		return pascalCase(str);
	case 'snake_case':
		return lowerCase(str).replace(/ /g, '_');
	case 'UPPER_CASE':
		return lowerCase(str).replace(/ /g, '_').toUpperCase();
	case 'kebab-case':
		return lowerCase(str).replace(/ /g, '-');
	}
};

function getLocation(start, fieldName = '') {
	const { line, column } = start;

	return {
		start: {
			line,
			column
		},
		end: {
			line,
			column: column + fieldName.length
		}
	};
}

const REPORT_ON_FIRST_CHARACTER = { column: 0, line: 1 };

const ARRAY_DEFAULT_OPTIONS = {
	type: 'array',
	uniqueItems: true,
	minItems: 1,
	items: {
		type: 'string'
	}
};

const englishJoinWords = words => new Intl.ListFormat('en-US', { type: 'disjunction' }).format(words);

function truthy(value) {
	return !!value;
}

const DisplayNodeNameMap = {
	[Kind.OBJECT_TYPE_DEFINITION]: 'type',
	[Kind.OBJECT_TYPE_EXTENSION]: 'type',
	[Kind.INTERFACE_TYPE_DEFINITION]: 'interface',
	[Kind.INTERFACE_TYPE_EXTENSION]: 'interface',
	[Kind.ENUM_TYPE_DEFINITION]: 'enum',
	[Kind.ENUM_TYPE_EXTENSION]: 'enum',
	[Kind.SCALAR_TYPE_DEFINITION]: 'scalar',
	[Kind.INPUT_OBJECT_TYPE_DEFINITION]: 'input',
	[Kind.INPUT_OBJECT_TYPE_EXTENSION]: 'input',
	[Kind.UNION_TYPE_DEFINITION]: 'union',
	[Kind.UNION_TYPE_EXTENSION]: 'union',
	[Kind.DIRECTIVE_DEFINITION]: 'directive',
	[Kind.FIELD_DEFINITION]: 'field',
	[Kind.ENUM_VALUE_DEFINITION]: 'enum value',
	[Kind.INPUT_VALUE_DEFINITION]: 'input value',
	[Kind.ARGUMENT]: 'argument',
	[Kind.VARIABLE]: 'variable',
	[Kind.FRAGMENT_DEFINITION]: 'fragment',
	[Kind.OPERATION_DEFINITION]: 'operation',
	[Kind.FIELD]: 'field'
};

function displayNodeName(node) {
	return `${node.kind === Kind.OPERATION_DEFINITION ? node.operation : DisplayNodeNameMap[node.kind]} "${('alias' in node && node.alias?.value) || ('name' in node && node.name?.value)}"`;
}

function getNodeName(node) {
	switch (node.kind) {
	case Kind.OBJECT_TYPE_DEFINITION:
	case Kind.OBJECT_TYPE_EXTENSION:
	case Kind.INTERFACE_TYPE_DEFINITION:
	case Kind.ENUM_TYPE_DEFINITION:
	case Kind.SCALAR_TYPE_DEFINITION:
	case Kind.INPUT_OBJECT_TYPE_DEFINITION:
	case Kind.UNION_TYPE_DEFINITION:
	case Kind.DIRECTIVE_DEFINITION:
		return displayNodeName(node);
	case Kind.FIELD_DEFINITION:
	case Kind.INPUT_VALUE_DEFINITION:
	case Kind.ENUM_VALUE_DEFINITION:
		return `${displayNodeName(node)} in ${displayNodeName(node.parent)}`;
	case Kind.OPERATION_DEFINITION:
		return node.name ? displayNodeName(node) : node.operation;
	}

	return '';
}

export {
	ARRAY_DEFAULT_OPTIONS,
	CWD,
	REPORT_ON_FIRST_CHARACTER,
	TYPES_KINDS,
	VIRTUAL_DOCUMENT_REGEX,
	camelCase,
	convertCase,
	displayNodeName,
	englishJoinWords,
	getLocation,
	getNodeName,
	getTypeName,
	logger,
	normalizePath,
	pascalCase,
	requireGraphQLSchemaFromContext,
	requireSiblingsOperations,
	truthy
};

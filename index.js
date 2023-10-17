import rules from './plugin-graphql/rules.js';
import parseForESLint from './plugin-graphql/parser.js';
import processor from './plugin-graphql/processor.js';
import { requireGraphQLSchemaFromContext, requireSiblingsOperations } from './plugin-graphql/utils.js';

export default [{
	languageOptions: {
		parser: { parseForESLint }
	},
	plugins: {
		graphql: {
			processors: { graphql: processor },
			requireGraphQLSchemaFromContext,
			requireSiblingsOperations,
			rules
		}
	},
	rules: {
		'graphql/description-style': 'error',
		'graphql/known-argument-names': 'error',
		'graphql/known-directives': 'error',
		'graphql/known-type-names': 'error',
		'graphql/lone-schema-definition': 'error',
		'graphql/naming-convention': [
			'error',
			{
				types: 'PascalCase',
				FieldDefinition: 'camelCase',
				InputValueDefinition: 'camelCase',
				Argument: 'camelCase',
				DirectiveDefinition: 'camelCase',
				EnumValueDefinition: 'UPPER_CASE'
			}
		],
		'graphql/no-case-insensitive-enum-values-duplicates': 'error',
		'graphql/no-unreachable-types': 'error',
		'graphql/provided-required-arguments': 'error',
		'graphql/require-deprecation-reason': 'error',
		'graphql/unique-directive-names': 'error',
		'graphql/unique-directive-names-per-location': 'error',
		'graphql/unique-field-definition-names': 'error',
		'graphql/unique-operation-types': 'error',
		'graphql/unique-type-names': 'error',
		'graphql/alphabetize': [
			'error',
			{
				fields: ['ObjectTypeDefinition', 'InterfaceTypeDefinition', 'InputObjectTypeDefinition'],
				values: true,
				arguments: ['FieldDefinition', 'Field', 'DirectiveDefinition', 'Directive']
			}
		],
		'graphql/input-name': 'error',
		'graphql/require-deprecation-date': 'error',
		'graphql/require-nullable-fields-with-oneof': 'error',
		'graphql/require-type-pattern-with-oneof': 'error',
		'graphql/type-usage-order': 'error'
	}
}];

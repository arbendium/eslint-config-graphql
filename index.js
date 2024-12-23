// eslint-disable-next-line import/no-unresolved
import graphqlPlugin from '@graphql-eslint/eslint-plugin';
import ruleTupeUsageOrder from './rules/type-usage-order.js';

graphqlPlugin.rules['type-usage-order'] = ruleTupeUsageOrder;

export default [{
	languageOptions: {
		parser: graphqlPlugin.parser
	},
	plugins: {
		graphql: graphqlPlugin
	},
	rules: {
		'graphql/alphabetize': [
			'error',
			{
				fields: ['ObjectTypeDefinition', 'InterfaceTypeDefinition', 'InputObjectTypeDefinition'],
				values: true,
				arguments: ['FieldDefinition', 'Field', 'DirectiveDefinition', 'Directive']
			}
		],
		'graphql/description-style': 'error',
		'graphql/input-name': 'error',
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
		'graphql/no-unreachable-types': 'error',
		'graphql/provided-required-arguments': 'error',
		'graphql/require-deprecation-date': 'error',
		'graphql/require-deprecation-reason': 'error',
		'graphql/require-nullable-fields-with-oneof': 'error',
		'graphql/require-type-pattern-with-oneof': 'error',
		'graphql/type-usage-order': 'error',
		'graphql/unique-directive-names-per-location': 'error',
		'graphql/unique-directive-names': 'error',
		'graphql/unique-enum-value-names': 'error',
		'graphql/unique-field-definition-names': 'error',
		'graphql/unique-operation-types': 'error',
		'graphql/unique-type-names': 'error'
	}
}];

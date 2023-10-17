/*
 * 🚨 IMPORTANT! Do not manually modify this file. Run: `yarn generate-configs`
 */

import GRAPHQL_JS_VALIDATIONS from './rules/graphql-js-validation.js';
import alphabetize from './rules/alphabetize.js';
import descriptionStyle from './rules/description-style.js';
import inputName from './rules/input-name.js';
import loneExecutableDefinition from './rules/lone-executable-definition.js';
import matchDocumentFilename from './rules/match-document-filename.js';
import namingConvention from './rules/naming-convention.js';
import noAnonymousOperations from './rules/no-anonymous-operations.js';
import noCaseInsensitiveEnumValuesDuplicates from './rules/no-case-insensitive-enum-values-duplicates.js';
import noDeprecated from './rules/no-deprecated.js';
import noDuplicateFields from './rules/no-duplicate-fields.js';
import noHashtagDescription from './rules/no-hashtag-description.js';
import noOnePlaceFragments from './rules/no-one-place-fragments.js';
import noRootType from './rules/no-root-type.js';
import noScalarResultTypeOnMutation from './rules/no-scalar-result-type-on-mutation.js';
import noTypenamePrefix from './rules/no-typename-prefix.js';
import noUnreachableTypes from './rules/no-unreachable-types.js';
import noUnusedFields from './rules/no-unused-fields.js';
import requireDeprecationDate from './rules/require-deprecation-date.js';
import requireDeprecationReason from './rules/require-deprecation-reason.js';
import requireDescription from './rules/require-description.js';
import requireFieldOfTypeQueryInMutationResult from './rules/require-field-of-type-query-in-mutation-result.js';
import requireIdWhenAvailable from './rules/require-id-when-available.js';
import requireImportFragment from './rules/require-import-fragment.js';
import requireNullableFieldsWithOneof from './rules/require-nullable-fields-with-oneof.js';
import requireNullableResultInRoot from './rules/require-nullable-result-in-root.js';
import requireTypePatternWithOneof from './rules/require-type-pattern-with-oneof.js';
import selectionSetDepth from './rules/selection-set-depth.js';
import strictIdInTypes from './rules/strict-id-in-types.js';
import typeUsageOrder from './rules/type-usage-order.js';
import uniqueFragmentName from './rules/unique-fragment-name.js';
import uniqueOperationName from './rules/unique-operation-name.js';

export default {
	...GRAPHQL_JS_VALIDATIONS,
	alphabetize,
	'description-style': descriptionStyle,
	'input-name': inputName,
	'lone-executable-definition': loneExecutableDefinition,
	'match-document-filename': matchDocumentFilename,
	'naming-convention': namingConvention,
	'no-anonymous-operations': noAnonymousOperations,
	'no-case-insensitive-enum-values-duplicates': noCaseInsensitiveEnumValuesDuplicates,
	'no-deprecated': noDeprecated,
	'no-duplicate-fields': noDuplicateFields,
	'no-hashtag-description': noHashtagDescription,
	'no-one-place-fragments': noOnePlaceFragments,
	'no-root-type': noRootType,
	'no-scalar-result-type-on-mutation': noScalarResultTypeOnMutation,
	'no-typename-prefix': noTypenamePrefix,
	'no-unreachable-types': noUnreachableTypes,
	'no-unused-fields': noUnusedFields,
	'require-deprecation-date': requireDeprecationDate,
	'require-deprecation-reason': requireDeprecationReason,
	'require-description': requireDescription,
	'require-field-of-type-query-in-mutation-result': requireFieldOfTypeQueryInMutationResult,
	'require-id-when-available': requireIdWhenAvailable,
	'require-import-fragment': requireImportFragment,
	'require-nullable-fields-with-oneof': requireNullableFieldsWithOneof,
	'require-nullable-result-in-root': requireNullableResultInRoot,
	'require-type-pattern-with-oneof': requireTypePatternWithOneof,
	'selection-set-depth': selectionSetDepth,
	'strict-id-in-types': strictIdInTypes,
	'type-usage-order': typeUsageOrder,
	'unique-fragment-name': uniqueFragmentName,
	'unique-operation-name': uniqueOperationName
};

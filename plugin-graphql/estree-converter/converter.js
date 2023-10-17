import {
	Kind, TypeInfo, visit, visitWithTypeInfo
} from 'graphql';
import { convertLocation } from './utils.js';

export default function convertToESTree(node, schema) {
	const typeInfo = schema && new TypeInfo(schema);

	const visitor = {
		leave(node, key, parent) {
			const leadingComments = 'description' in node && node.description
				? [{
					type: node.description.block ? 'Block' : 'Line',
					value: node.description.value
				}]
				: [];

			const calculatedTypeInfo = typeInfo
				? {
					argument: typeInfo.getArgument(),
					defaultValue: typeInfo.getDefaultValue(),
					directive: typeInfo.getDirective(),
					enumValue: typeInfo.getEnumValue(),
					fieldDef: typeInfo.getFieldDef(),
					inputType: typeInfo.getInputType(),
					parentInputType: typeInfo.getParentInputType(),
					parentType: typeInfo.getParentType(),
					gqlType: typeInfo.getType()
				}
				: {};

			const rawNode = () => {
				if (parent && key !== undefined) {
					return parent[key];
				}

				return node.kind === Kind.DOCUMENT
					? {
						...node,
						definitions: node.definitions.map(definition => definition.rawNode())
					}
					: node;
			};

			const commonFields = {
				...node,
				type: node.kind,
				loc: convertLocation(node.loc),
				range: [node.loc.start, node.loc.end],
				leadingComments,
				// Use function to prevent RangeError: Maximum call stack size exceeded
				typeInfo: () => calculatedTypeInfo, // Don't know if can fix error
				rawNode
			};

			return 'type' in node
				? {
					...commonFields,
					gqlType: node.type
				}
				: commonFields;
		}
	};

	return visit(
		node,
		typeInfo ? visitWithTypeInfo(typeInfo, visitor) : visitor
	);
}

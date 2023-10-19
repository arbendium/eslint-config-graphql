import {
	isListType,
	isNonNullType,
	Lexer,
	Source,
	TokenKind
} from 'graphql';
import { valueFromASTUntyped } from 'graphql/utilities/valueFromASTUntyped.js';

const valueFromNode = (...args) => valueFromASTUntyped(...args);

function getBaseType(type) {
	if (isNonNullType(type) || isListType(type)) {
		return getBaseType(type.ofType);
	}

	return type;
}

function convertToken(token, type) {
	const {
		line, column, end, start, value
	} = token;

	return {
		type,
		value,
		/*
     * ESLint has 0-based column number
     * https://eslint.org/docs/developer-guide/working-with-rules#contextreport
     */
		loc: {
			start: {
				line,
				column: column - 1
			},
			end: {
				line,
				column: column - 1 + (end - start)
			}
		},
		range: [start, end]
	};
}

function extractTokens(filePath, code) {
	const source = new Source(code, filePath);
	const lexer = new Lexer(source);
	const tokens = [];

	let token = lexer.advance();

	while (token && token.kind !== TokenKind.EOF) {
		const result = convertToken(token, token.kind);
		tokens.push(result);
		token = lexer.advance();
	}

	return tokens;
}

function extractComments(loc) {
	if (!loc) {
		return [];
	}

	const comments = [];
	let token = loc.startToken;

	while (token) {
		if (token.kind === TokenKind.COMMENT) {
			const comment = convertToken(
				token,
				// `eslint-disable` directive works only with `Block` type comment
				token.value.trimStart().startsWith('eslint') ? 'Block' : 'Line'
			);
			comments.push(comment);
		}
		token = token.next;
	}

	return comments;
}

function convertLocation(location) {
	const {
		startToken, endToken, source, start, end
	} = location;
	const loc = {
		start: {
			/*
       * Kind.Document has startToken: { line: 0, column: 0 }, we set line as 1 and column as 0
       */
			line: startToken.line === 0 ? 1 : startToken.line,
			column: startToken.column === 0 ? 0 : startToken.column - 1
		},
		end: {
			line: endToken.line,
			column: endToken.column - 1
		},
		source: source.body
	};
	if (loc.start.column === loc.end.column) {
		loc.end.column += end - start;
	}

	return loc;
}

export {
	convertLocation,
	convertToken,
	extractComments,
	extractTokens,
	getBaseType,
	valueFromNode
};

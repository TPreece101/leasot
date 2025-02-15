import _ from 'lodash';
import { ExtensionsDb, ParseConfig, ParserFactory, ParserFactoryConfig, TodoComment } from '../definitions.js';

const parsersDb: ExtensionsDb = {
    '.bash': { parserName: 'coffeeParser' },
    '.c': { parserName: 'defaultParser' },
    '.cjs': { parserName: 'defaultParser' },
    '.cjsx': { parserName: 'coffeeParser' },
    '.clj': { parserName: 'clojureParser' },
    '.cljs': { parserName: 'clojureParser' },
    '.cljc': { parserName: 'clojureParser' },
    '.coffee': { parserName: 'coffeeParser' },
    '.cpp': { parserName: 'defaultParser' },
    '.cr': { parserName: 'coffeeParser' },
    '.cs': { parserName: 'defaultParser' },
    '.cson': { parserName: 'coffeeParser' },
    '.css': { parserName: 'defaultParser' },
    '.ctp': { parserName: 'defaultParser', includedFiles: ['.html', '.js', '.css'] },
    '.cts': { parserName: 'defaultParser' },
    '.ejs': { parserName: 'ejsParser' },
    '.erb': { parserName: 'ejsParser' },
    '.erl': { parserName: 'erlangParser' },
    '.es': { parserName: 'defaultParser' },
    '.es6': { parserName: 'defaultParser' },
    '.ex': { parserName: 'coffeeParser' },
    '.exs': { parserName: 'coffeeParser' },
    '.fs': { parserName: 'fsharpParser' },
    '.gd': { parserName: 'coffeeParser' },
    '.go': { parserName: 'defaultParser' },
    '.h': { parserName: 'defaultParser' },
    '.haml': { parserName: 'hamlParser' },
    '.handlebars': { parserName: 'hbsParser' },
    '.hbs': { parserName: 'hbsParser' },
    '.hcl': { parserName: ['defaultParser', 'coffeeParser'] },
    '.hgn': { parserName: 'hbsParser' },
    '.hogan': { parserName: 'hbsParser' },
    '.hrl': { parserName: 'erlangParser' },
    '.hs': { parserName: 'haskellParser' },
    '.htm': { parserName: 'twigParser' },
    '.html': { parserName: 'twigParser' },
    '.jade': { parserName: 'jadeParser' },
    '.java': { parserName: 'defaultParser' },
    '.jl': { parserName: 'pythonParser' },
    '.js': { parserName: 'defaultParser' },
    '.jsx': { parserName: 'defaultParser' },
    '.kt': { parserName: 'defaultParser' },
    '.less': { parserName: 'defaultParser' },
    '.lua': { parserName: 'luaParser' },
    '.m': { parserName: 'defaultParser' },
    '.markdown': { parserName: 'twigParser' },
    '.md': { parserName: 'twigParser' },
    '.mjs': { parserName: 'defaultParser' },
    '.mm': { parserName: 'defaultParser' },
    '.mts': { parserName: 'defaultParser' },
    '.mustache': { parserName: 'hbsParser' },
    '.njk': { parserName: 'twigParser' },
    '.pas': { parserName: 'pascalParser' },
    '.php': { parserName: 'defaultParser', includedFiles: ['.html', '.js', '.css'] },
    '.pl': { parserName: 'coffeeParser' },
    '.pm': { parserName: 'coffeeParser' },
    '.proto': { parserName: 'defaultParser' },
    '.pug': { parserName: 'jadeParser' },
    '.py': { parserName: 'pythonParser' },
    '.rb': { parserName: 'coffeeParser' },
    '.rs': { parserName: 'defaultParser' },
    '.sass': { parserName: 'defaultParser' },
    '.scala': { parserName: 'defaultParser' },
    '.scss': { parserName: 'defaultParser' },
    '.sh': { parserName: 'coffeeParser' },
    '.sql': { parserName: ['defaultParser', 'haskellParser'] },
    '.ss': { parserName: 'ssParser' },
    '.styl': { parserName: 'defaultParser' },
    '.svelte': { parserName: 'twigParser', includedFiles: ['.html', '.js', '.css'] },
    '.swift': { parserName: 'defaultParser' },
    '.tex': { parserName: 'latexParser' },
    '.tf': { parserName: ['defaultParser', 'coffeeParser'] },
    '.ts': { parserName: 'defaultParser' },
    '.tsx': { parserName: 'defaultParser' },
    '.twig': { parserName: 'twigParser' },
    '.vue': { parserName: 'twigParser', includedFiles: ['.html', '.js', '.css'] },
    '.yaml': { parserName: 'coffeeParser' },
    '.yml': { parserName: 'coffeeParser' },
    '.zsh': { parserName: 'coffeeParser' },
};

/**
 * Extend the extensions database at runtime, by either adding support for new extensions or overriding existing ones
 * @param extendedDb The extension database to extend with
 */
export const associateExtWithParser = (extendedDb: ExtensionsDb): void => {
    const keys = Object.keys(extendedDb);
    if (keys.length === 0) {
        return;
    }
    keys.forEach(function (extension) {
        if (extension.length <= 1 || extension[0] !== '.') {
            throw new TypeError(`Cannot register extension: invalid extension ${extension}`);
        }
        const parser = extendedDb[extension];
        if (!parser || !parser.parserName) {
            throw new TypeError('Cannot register extension: `parserName` is missing');
        }
    });

    // Add any additional parsers.
    Object.assign(parsersDb, extendedDb);
};

/**
 * Check whether the provided extension is currently supported
 * @param extension the extension to check
 */
export const isExtensionSupported = (extension: string): boolean => parsersDb.hasOwnProperty(extension);

/**
 * Get the effective active parser names from an extension
 */
const getActiveParserNames = (extension: string, withInlineFiles: boolean): string[] => {
    const originalParser = parsersDb[extension];
    let parserNames = [].concat(originalParser.parserName);

    const includedFiles = originalParser.includedFiles || [];
    if (withInlineFiles) {
        includedFiles.forEach((includedExtension) => {
            // parserName could be an array
            parserNames = parserNames.concat(parsersDb[includedExtension].parserName);
        });
        parserNames = _.uniq(parserNames);
    }
    return parserNames;
};

/**
 * Parse the provided content and return an array of parsed items
 * @param content The contents to parse
 * @param config The parse configuration
 */
export const parse = async (content: string, config: ParseConfig): Promise<TodoComment[]> => {
    const {
        associateParser = {},
        customParsers = {},
        customTags = [],
        extension,
        filename,
        withInlineFiles = false,
    } = config;

    // Associate extensions with bundled parsers
    associateExtWithParser(associateParser);

    if (!isExtensionSupported(extension)) {
        throw new Error(`extension ${extension} is not supported.`);
    }
    if (customTags && !Array.isArray(customTags)) {
        throw new TypeError('`customTags` must be an array');
    }
    const parseOptions: ParserFactoryConfig = { customTags };
    const parserNames = getActiveParserNames(extension, withInlineFiles);

    const comments = await Promise.all(
        parserNames.map(async (parserName) => {
            let parserFactory: ParserFactory;
            if (customParsers[parserName]) {
                parserFactory = customParsers[parserName];
            } else {
                const { default: parserFunc } = await import(`./parsers/${parserName}.js`);
                parserFactory = parserFunc;
            }
            const parser = parserFactory(parseOptions);
            return parser(content, filename);
        })
    );

    const parsed = comments
        .reduce((items: TodoComment[], item: TodoComment[]) => {
            return items.concat(item);
        }, [])
        .sort((item1: TodoComment, item2: TodoComment) => item1.line - item2.line);

    return _.uniqWith(parsed, function (a, b) {
        return a.line === b.line && a.tag === b.tag && a.text === b.text;
    });
};

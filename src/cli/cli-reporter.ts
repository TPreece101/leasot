import getStdin from 'get-stdin';
import globby from 'globby';
import logSymbols from 'log-symbols';
import { mapLimit } from 'async';
import { readFile } from 'fs';
import { report } from '..';
import { resolve } from 'path';
import { BuiltinReporters, ReporterName, TodoComment } from '../definitions';
import { CommanderStatic } from 'commander';

const CONCURRENCY_LIMIT = 50;

/**
 * @hidden
 */
export interface ReporterProgramArgs {
    readonly exitNicely?: boolean;
    readonly ignore?: string[];
    readonly reporter?: BuiltinReporters | ReporterName;
}

const outputTodos = (todos: TodoComment[], options: ReporterProgramArgs) => {
    try {
        const output = report(todos, options.reporter);
        console.log(output);
    } catch (e) {
        console.error(e);
    }
    if (options.exitNicely) {
        process.exit(0);
    }
    process.exit(todos.length ? 1 : 0);
};

const parseAndReportFiles = (fileGlobs: string[], options: ReporterProgramArgs): void => {
    // Get all files and their resolved globs
    const files = globby.sync(fileGlobs, {
        ignore: options.ignore || [],
    });

    if (!files || !files.length) {
        console.log(logSymbols.warning, 'No files found for reporting');
        process.exit(1);
    }

    // Parallel read all of the given files
    mapLimit(
        files,
        CONCURRENCY_LIMIT,
        (file, cb) => readFile(resolve(process.cwd(), file), 'utf8', cb),
        (err, results: string[]) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            const todos = results
                .map(content => JSON.parse(content))
                // filter files without any parsed content
                .filter(item => item && item.length > 0)
                .reduce((items, item) => items.concat(item), []);

            outputTodos(todos, options);
        }
    );
};

const run = (program: CommanderStatic): void => {
    const options = program.opts();
    if (program.args && program.args.length > 0) {
        return parseAndReportFiles(program.args, options);
    }

    if (process.stdin.isTTY) {
        return program.help();
    }

    getStdin()
        .then(function (content: string) {
            const todos = JSON.parse(content);
            outputTodos(todos, options);
        })
        .catch(function (e) {
            console.error(e);
            process.exit(1);
        });
};

export default run;

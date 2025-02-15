import fs from 'fs';
import path from 'path';
import should from 'should';
import { CustomParsers, ParseConfig, Tag, TodoComment } from '../src/definitions.js';
import * as leasot from '../src/index.js';

function getFixturePath(file: string): string {
    return path.join('./tests/fixtures/', file);
}

async function getComments(file: string, config: Partial<ParseConfig> = {}) {
    const content = fs.readFileSync(file, 'utf8');
    const ext = path.extname(file);

    return await leasot.parse(content, {
        associateParser: config.associateParser,
        customParsers: config.customParsers,
        customTags: config.customTags,
        extension: ext,
        filename: file,
        withInlineFiles: config.withInlineFiles,
    });
}

function verifyComment(actual: TodoComment, tag: Tag, line: number, text: string, ref: any = null) {
    actual.tag.should.equal(tag);
    actual.line.should.equal(line);
    actual.text.should.equal(text);
    if (ref !== null) {
        actual.ref.should.equal(ref);
    }
}

describe('parsing', function () {
    describe('edge cases', function () {
        it('javascript', async function () {
            const file = getFixturePath('edge-cases.js');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(5);
            verifyComment(comments[0], 'TODO', 1, '');
            verifyComment(comments[1], 'TODO', 2, '');
            verifyComment(comments[2], 'TODO', 3, 'text');
            verifyComment(comments[3], 'TODO', 4, 'something / after slash');
            verifyComment(comments[4], 'TODO', 5, 'something with a URL http://example.com/path');
        });
    });

    describe('stylus', function () {
        it('parse simple line comments', async function () {
            const file = getFixturePath('line.styl');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 4, 'use fixmes as well');
        });

        it('parse block line comments', async function () {
            const file = getFixturePath('block.styl');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 5, 'single line comment with a todo');
            verifyComment(comments[1], 'FIXME', 6, 'single line comment with a todo');
        });
    });

    describe('handlebars', function () {
        it('parse {{! }} and {{!-- --}} comments', async function () {
            const file = getFixturePath('handlebars.hbs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'only output this author names if an author exists');
            verifyComment(comments[1], 'FIXME', 8, 'This comment will not be in the output');
            verifyComment(comments[2], 'TODO', 13, 'Multiple line comment');
            verifyComment(comments[3], 'TODO', 13, 'and again');
        });
    });

    describe('mustache', function () {
        it('parse {{! }} and {{!-- --}} comments', async function () {
            const file = getFixturePath('mustache.mustache');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'only output this author names if an author exists');
            verifyComment(comments[1], 'FIXME', 8, 'This comment will not be in the output');
            verifyComment(comments[2], 'TODO', 13, 'Multiple line comment');
            verifyComment(comments[3], 'TODO', 13, 'and again');
        });
    });

    describe('hogan', function () {
        it('parse {{! }} and {{!-- --}} comments', async function () {
            const file = getFixturePath('hogan.hgn');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'only output this author names if an author exists');
            verifyComment(comments[1], 'FIXME', 8, 'This comment will not be in the output');
            verifyComment(comments[2], 'TODO', 13, 'Multiple line comment');
            verifyComment(comments[3], 'TODO', 13, 'and again');
        });
    });

    describe('c++', function () {
        it('parse // and /* style comments', async function () {
            const file = getFixturePath('cplusplus.cpp');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'document file operations');
            verifyComment(comments[1], 'FIXME', 10, 'make sure file can be closed');
        });
    });

    describe('c#', function () {
        it('parse // and /* style comments', async function () {
            const file = getFixturePath('csharp.cs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'document file operations');
            verifyComment(comments[1], 'FIXME', 11, 'do something with the file contents');
        });
    });

    describe('c', function () {
        it('parse // and /* style comments', async function () {
            const file = getFixturePath('c.c');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 6, 'decide whether to use a pointer');
            verifyComment(comments[1], 'FIXME', 18, 'make sure file can be closed');
        });
    });

    describe('go', function () {
        it('parse // and /* style comments', async function () {
            const file = getFixturePath('go.go');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 3, 'be more explicit here');
        });
    });

    describe('c header', function () {
        it('parse // and /* style comments', async function () {
            const file = getFixturePath('c.h');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 4, 'should use a double');
        });
    });

    describe('erlang', function () {
        it('parse % comments', async function () {
            const file = getFixturePath('erlang.erl');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 're-write this');
            verifyComment(comments[1], 'FIXME', 3, 'something useful');
        });
    });

    describe('ruby', function () {
        it('parse # comments', async function () {
            const file = getFixturePath('ruby.rb');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'initialize things lol');
            verifyComment(comments[1], 'FIXME', 10, 'just kidding, pizza is everything in life, nothing to fix here');
        });
    });

    describe('crystal', function () {
        it('parse # comments', async function () {
            const file = getFixturePath('crystal.cr');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 4, 'Write tests');
        });
    });

    describe('haml', function () {
        it('parse -# comments and / comments', async function () {
            const file = getFixturePath('haml.haml');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'All your base are belong to us.');
            verifyComment(comments[1], 'FIXME', 5, 'Someone set up us the bomb.');
            verifyComment(comments[2], 'TODO', 9, 'All your base are belong to us. You are on the way to destruction.');
            verifyComment(comments[3], 'FIXME', 11, 'You have no chance to survive make your time. Ha ha ha...');
        });
    });

    describe('haskell', function () {
        it('parse -- comments', async function () {
            const file = getFixturePath('haskell.hs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 4, 'force evaluation of the given value');
            verifyComment(comments[1], 'TODO', 10, 'this will be deprecated soon');
        });
    });

    describe('sql', function () {
        it('parse -- and /* comments', async function () {
            const file = getFixturePath('sql.sql');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'Sql multi comment');
            verifyComment(comments[1], 'TODO', 10, 'Sql single comment');
        });
    });

    describe('html', function () {
        it('parse <!-- --> comments', async function () {
            const file = getFixturePath('HTML.html');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 1, 'change this tag from Id to class');
            verifyComment(comments[1], 'TODO', 9, 'Please add something more interesting here');
        });
    });

    describe('htm', function () {
        it('parse <!-- comments', async function () {
            const file = getFixturePath('HTML.htm');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 1, 'change this tag from Id to class');
            verifyComment(comments[1], 'TODO', 9, 'Please add something more interesting here');
        });
    });

    describe('jl', function () {
        it('handle # comments', async function () {
            var file = getFixturePath('julia.jl');
            var comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 4, 'Support POST');
            verifyComment(comments[1], 'TODO', 5, 'Foobar print');
            verifyComment(comments[2], 'TODO', 7, 'End function');
        });
    });

    describe('ejs', function () {
        it('parse <!-- --> and <%# %> comments', async function () {
            const file = getFixturePath('ejs.ejs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'FIXME', 1, 'change this tag from Id to class');
            verifyComment(comments[1], 'FIXME', 2, 'change this tag from Id to class');
            verifyComment(comments[2], 'TODO', 10, 'Please add something more interesting here');
            verifyComment(comments[3], 'TODO', 11, 'Please add something more interesting here');
        });
    });

    describe('pascal', function () {
        it('parse // and { } comments', async function () {
            const file = getFixturePath('pascal.pas');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 1, 'Add more stuff');
            verifyComment(comments[1], 'FIXME', 4, 'Say something cool');
            verifyComment(comments[2], 'FIXME', 6, 'Add a space');
            verifyComment(comments[3], 'TODO', 10, "Display the user's name");
        });
    });

    describe('python', function () {
        it('parse # and """ comments', async function () {
            const file = getFixturePath('python.py');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 6, 'refactor this');
            verifyComment(comments[1], 'FIXME', 12, 'Move this out');
        });
    });

    describe('latex', function () {
        it('parse % and \\begin{comment} comments', async function () {
            const file = getFixturePath('tex.tex');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 3, 'refactor this');
            verifyComment(comments[1], 'FIXME', 9, 'Move this out');
            verifyComment(comments[2], 'TODO', 15, 'Do many multiple multiple line comments work?');
        });
    });

    describe('perl module', function () {
        it('parse # comments', async function () {
            const file = getFixturePath('perl_module.pm');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 3, 'Use python');
            verifyComment(comments[1], 'TODO', 18, 'still waiting for perl6?');
        });
    });

    describe('perl script', function () {
        it('parse # comments', async function () {
            const file = getFixturePath('perl.pl');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 3, 'Refactor this');
            verifyComment(comments[1], 'FIXME', 6, 'fix the code below');
        });
    });

    describe('sass', function () {
        it('parse // and /* comments', async function () {
            const file = getFixturePath('block.sass');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'it will appear in the CSS output.');
            verifyComment(comments[1], 'FIXME', 3, 'this is a block comment too');
            verifyComment(comments[2], 'FIXME', 10, "They won't appear in the CSS output,");
            verifyComment(comments[3], 'TODO', 14, 'improve this syntax');
        });
    });

    describe('scss', function () {
        it('parse // and /* comments', async function () {
            const file = getFixturePath('block.scss');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 4, 'add another class');
        });
    });

    describe('typescript', function () {
        it('parse // and /* comments with ts extension', async function () {
            const file = getFixturePath('typescript.ts');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'change to public');
            verifyComment(comments[1], 'FIXME', 11, 'use jquery');
        });
        it('parse // and /* comments with tsx extension', async function () {
            const file = getFixturePath('typescript.tsx');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'change to public');
            verifyComment(comments[1], 'FIXME', 11, 'use jquery');
        });
        it('parse // and /* comments with cts extension', async function () {
            const file = getFixturePath('typescript.cts');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'change to public');
            verifyComment(comments[1], 'FIXME', 11, 'use jquery');
        });
        it('parse // and /* comments with mts extension', async function () {
            const file = getFixturePath('typescript.mts');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'change to public');
            verifyComment(comments[1], 'FIXME', 11, 'use jquery');
        });
    });

    describe('jsdoc', function () {
        it('handle jsdoc comments', async function () {
            const file = getFixturePath('jsdoc.js');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 14, 'Show my TODO please');
        });

        it('handle jsdoc @todo comments', async function () {
            const file = getFixturePath('jsdoc2.js');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 9, 'make this supported');
        });
    });

    describe('coffeescript', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('coffee.coffee');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 1, 'Do something');
            verifyComment(comments[1], 'FIXME', 3, 'Fix something');
        });
    });

    describe('coffee-react', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('coffee-react.cjsx');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 1, 'better document');
        });
    });

    describe('zsh', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('zsh.zsh');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 17, 'complete file');
        });
    });

    describe('yaml', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('yaml.yaml');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 7, 'Support POST');
        });
        it('handle # comments with withInlineFiles', async function () {
            const file = getFixturePath('yaml.yaml');
            const comments = await getComments(file, { withInlineFiles: true });
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 7, 'Support POST');
        });
    });

    describe('yml', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('yaml.yml');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 7, 'Support POST');
        });
    });

    describe('bash', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('bash.bash');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 5, 'wrap variables in quotes');
        });
    });

    describe('sh', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('sh.sh');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 31, 'we now exit the program');
        });
    });

    describe('gdscript', function () {
        it('handle # comments', async function () {
            const file = getFixturePath('gdscript.gd');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 4, 'pre-initialize variable');
        });
    });

    describe('ss', function () {
        it('handle <%-- --%> and <!-- --> comments', async function () {
            const file = getFixturePath('silverstripe.ss');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'FIXME', 4, 'title is incorrect');
            verifyComment(comments[1], 'TODO', 6, 'add stylesheets and scripts');
            verifyComment(comments[2], 'FIXME', 11, '$Condition is not defined');
        });
    });

    describe('less', function () {
        it('handles block and inline comment forms', async function () {
            const file = getFixturePath('block.less');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'TODO', 2, 'it will appear in the CSS output.');
            verifyComment(comments[1], 'FIXME', 3, 'this is a block comment too');
            verifyComment(comments[2], 'FIXME', 10, "They won't appear in the CSS output,");
            verifyComment(comments[3], 'TODO', 14, 'improve this syntax');
        });
    });

    describe('twig', function () {
        it('matches bang and html comment style', async function () {
            const file = getFixturePath('twig.twig');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 1, "Hey, I'm a fixme!");
            verifyComment(comments[1], 'TODO', 13, "Hey, I'm a todo!");
        });
    });

    describe('Objective-C', function () {
        it('handles standard js comments', async function () {
            const file = getFixturePath('objective.m');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 4, 'better rename this variable');
        });
    });

    describe('Objective-C++', function () {
        it('handles standard js comments', async function () {
            const file = getFixturePath('objective.mm');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 4, 'better rename this variable');
        });
    });

    describe('jsx', function () {
        it('handles standard js comments in jsx', async function () {
            const file = getFixturePath('react.jsx');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 14, 'Show my TODO please');
            verifyComment(comments[1], 'FIXME', 21, 'illogical');
        });
    });

    describe('jade', function () {
        it('handle // style comments', async function () {
            const file = getFixturePath('comments.jade');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 9, 'this is a todo');
            verifyComment(comments[1], 'FIXME', 11, 'also should be caught');
        });
    });

    describe('php', function () {
        it('handles standard js comments in php', async function () {
            const file = getFixturePath('sample.php');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 2, 'This is a single-line comment');
            verifyComment(comments[1], 'FIXME', 7, 'implement single line comment');
            verifyComment(comments[2], 'TODO', 14, 'supported?');
        });
    });

    describe('ctp', function () {
        it('handles standard js comments in ctp', async function () {
            const file = getFixturePath('sample.ctp');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 2, 'This is a single-line comment');
            verifyComment(comments[1], 'FIXME', 7, 'implement single line comment');
            verifyComment(comments[2], 'TODO', 14, 'supported?');
        });
    });

    describe('swift', function () {
        it('handles standard comments in swift', async function () {
            const file = getFixturePath('swift.swift');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 2, 'perimeter of the Shape.');
            verifyComment(comments[1], 'FIXME', 5, 'perimeter');
        });
    });

    describe('custom tags', function () {
        it('custom tags', async function () {
            const file = getFixturePath('custom-tags.rb');
            const comments = await getComments(file, {
                customTags: ['review'],
            });
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'REVIEW', 4, 'make sure this works');
            verifyComment(comments[1], 'FIXME', 10, 'just kidding');
        });

        it('custom tag is temporary', async function () {
            const file = getFixturePath('custom-tags.rb');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 10, 'just kidding');
        });

        it('custom tag matches strict', async function () {
            const file = getFixturePath('strict-tags.php');
            const comments = await getComments(file, {
                customTags: ['prod'],
            });
            should.exist(comments);
            comments.should.have.length(4);
            verifyComment(comments[0], 'PROD', 7, 'list1');
            verifyComment(comments[1], 'PROD', 8, 'list2');
            verifyComment(comments[2], 'PROD', 9, 'list3');
            verifyComment(comments[3], 'PROD', 11, 'list4');
        });
    });

    describe('with inline files', function () {
        it('parses a php file without included files', async function () {
            const file = getFixturePath('with-inline.php');
            const [comments] = await Promise.all([
                getComments(file, {
                    withInlineFiles: false,
                }),
            ]);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 2, 'This is a single-line comment');
        });

        it('parses a php file with just php', async function () {
            const file = getFixturePath('with-inline.php');
            const comments = await getComments(file, {
                withInlineFiles: true,
            });
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 2, 'This is a single-line comment');
            verifyComment(comments[1], 'FIXME', 9, 'change this tag from Id to class');
        });
    });

    describe('vue', function () {
        it('parses a vue file without included files', async function () {
            const file = getFixturePath('vue.vue');
            const comments = await getComments(file, {
                withInlineFiles: false,
            });
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 2, 'Vue template comment');
        });

        it('parses a vue file with just php', async function () {
            const file = getFixturePath('vue.vue');
            const comments = await getComments(file, {
                withInlineFiles: true,
            });
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 2, 'Vue template comment');
            verifyComment(comments[1], 'TODO', 7, 'Vue script comment');
            verifyComment(comments[2], 'FIXME', 20, 'Vue style comment');
        });
    });

    describe('svelte', function () {
        it('parses a svelte file without included files', async function () {
            const file = getFixturePath('svelte.svelte');
            const comments = await getComments(file, {
                withInlineFiles: false,
            });
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 14, 'Svelte template comment');
        });

        it('parses a svelte file with just php', async function () {
            const file = getFixturePath('svelte.svelte');
            const comments = await getComments(file, {
                withInlineFiles: true,
            });
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 2, 'Svelte script comment');
            verifyComment(comments[1], 'FIXME', 9, 'Svelte style comment');
            verifyComment(comments[2], 'TODO', 14, 'Svelte template comment');
        });
    });

    describe('associate parser', function () {
        it('supports new extension', function () {
            const association = { '.cls': { parserName: 'defaultParser' } };
            leasot.associateExtWithParser(association);

            leasot.isExtensionSupported('.cls').should.equal(true);
        });

        it('parses newly associated file using specified parser', async function () {
            const file = getFixturePath('salesforce-apex.cls');
            const comments = await getComments(file, {
                associateParser: { '.cls': { parserName: 'defaultParser' } },
            });
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'Add detail');
            verifyComment(comments[1], 'FIXME', 7, 'do something with the file contents');
        });
    });

    describe('references', function () {
        it('leading', async function () {
            const file = getFixturePath('reference-leading.js');
            const comments = await getComments(file);
            comments.should.have.length(1);
            verifyComment(comments[0], 'TODO', 3, 'Use Symbol instead', 'tregusti');
        });

        it('trailing', async function () {
            const file = getFixturePath('reference-trailing.rb');
            const comments = await getComments(file);
            comments.should.have.length(1);
            verifyComment(comments[0], 'FIXME', 2, 'Make it better', 'tregusti');
        });
    });

    describe('java', function () {
        it('handle java lines comments', async function () {
            const file = getFixturePath('java.java');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 6, 'Change language');
        });

        it('handle java block comments', async function () {
            const file = getFixturePath('java.java');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[1], 'FIXME', 9, 'Log response');
        });
    });

    describe('kotlin', function () {
        it('handle kotlin lines comments', async function () {
            const file = getFixturePath('kotlin.kt');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'Change language');
        });

        it('handle kotlin block comments', async function () {
            const file = getFixturePath('kotlin.kt');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[1], 'FIXME', 7, 'Log response');
        });
    });

    describe('scala', function () {
        it('handle scala line comments', async function () {
            const file = getFixturePath('Scala.scala');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'Do something');
        });

        it('handle scala block comments', async function () {
            const file = getFixturePath('Scala.scala');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[1], 'FIXME', 8, 'Fix something');
        });
    });

    describe('markdown', function () {
        it('parse <!-- --> comments in .markdown', async function () {
            const file = getFixturePath('markdown.markdown');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 3, 'Update instructions');
            verifyComment(comments[1], 'TODO', 7, 'Add docs');
        });

        it('parse <!-- --> comments in .md', async function () {
            const file = getFixturePath('markdown.md');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 3, 'Update instructions');
            verifyComment(comments[1], 'TODO', 7, 'Add docs');
        });
    });

    describe('clojure', function () {
        it('handle comments', async function () {
            const file = getFixturePath('clojure.clj');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 2, 'This is a single line comment');
            verifyComment(comments[1], 'FIXME', 3, 'This is a single line fixme');
        });
    });

    describe('fsharp', function () {
        it('handle comments', async function () {
            const file = getFixturePath('f-sharp.fs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 3, 'This is a single line comment');
            verifyComment(comments[1], 'FIXME', 7, 'This is a single line fixme');
            verifyComment(comments[2], 'TODO', 16, 'This is a multiline todo');
        });
    });

    describe('rust', function () {
        it('handle rust lines comments', async function () {
            const file = getFixturePath('rust.rs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 1, 'This is a single-line comment');
        });

        it('handle rust block comments', async function () {
            const file = getFixturePath('rust.rs');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[1], 'FIXME', 5, 'implement single line comment');
            verifyComment(comments[2], 'TODO', 10, 'supported?');
        });
    });

    describe('protocol-buffer', function () {
        it('handle protocol-buffer lines comments', async function () {
            const file = getFixturePath('protocol-buffer.proto');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[1], 'TODO', 14, 'implements list method');
        });

        it('handle protocol-buffer block comments', async function () {
            const file = getFixturePath('protocol-buffer.proto');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'FIXME', 4, 'implement single line comment');
        });
    });

    describe('lua', function () {
        it('parse -- comments and --[[ ]] comments', async function () {
            const file = getFixturePath('lua.lua');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(5);

            verifyComment(comments[0], 'TODO', 2, 'Support POST');
            verifyComment(comments[1], 'FIXME', 3, 'Foobar print');
            verifyComment(comments[2], 'TODO', 5, 'End function');
            verifyComment(comments[3], 'FIXME', 11, 'maybe');
            verifyComment(comments[4], 'TODO', 12, 'fix this');
        });
    });

    describe('elixir', function () {
        it('parse -- comments and --[[ ]] comments', async function () {
            const file = getFixturePath('elixir.ex');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(1);

            verifyComment(comments[0], 'TODO', 2, 'add "!"');
        });
    });

    describe('terraform', function () {
        it('handle terraform lines comments', async function () {
            const file = getFixturePath('terraform.tf');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[0], 'TODO', 1, 'This is a single-line comment');
        });

        it('handle terraform block comments', async function () {
            const file = getFixturePath('terraform.tf');
            const comments = await getComments(file);
            should.exist(comments);
            comments.should.have.length(3);
            verifyComment(comments[1], 'FIXME', 3, 'Implement single line comment');
            verifyComment(comments[2], 'TODO', 8, 'This is a multiple-lines comment block');
        });
    });

    describe('custom parsers', function () {
        it('returns custom parser todos', async function () {
            const file = getFixturePath('file.unsupported');
            const customParsers: CustomParsers = {
                customParser: function (_parseOptions) {
                    return function parse(_contents, file) {
                        return [
                            {
                                file: file,
                                tag: 'TODO',
                                line: 4,
                                text: 'Do something',
                                ref: '',
                            },
                            {
                                file: file,
                                tag: 'TODO',
                                line: 5,
                                text: 'Do something else',
                                ref: '',
                            },
                        ];
                    };
                },
            };

            const config: ParseConfig = {
                associateParser: { '.unsupported': { parserName: 'customParser' } },
                extension: '.unsupported',
                customParsers: customParsers,
            };

            const comments = await getComments(file, config);
            should.exist(comments);
            comments.should.have.length(2);
            verifyComment(comments[0], 'TODO', 4, 'Do something');
            verifyComment(comments[1], 'TODO', 5, 'Do something else');
        });
    });
});

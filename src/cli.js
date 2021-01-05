#!/usr/bin/env node

const wsd = require("websequencediagrams");
const fs = require("fs");
const util = require("util");
const { Command } = require("commander");

const progress = require('cli-progress');
const colors = require('colors');

const bar = new progress.SingleBar({
    format: 'Creating... |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    stream: process.stdout,
});

const program = new Command();

program.version('0.0.3', '-v, --version', 'output the current version');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const regexSplitDiagrams = /(^|\r|\n)title[ \t]+/g;
const regexEmptyLines = /[ \t\r\n]+/g;
const regexDiagramTitle = /^title[ \t]+([^\r\n]+)/;

const extensions = ['png', 'jpeg', 'jpg'];

const isExtensionValid = extension => extensions.find(ext => ext === extension);

const buildDiagram = async (diagramSource, extension = "png", outputDir = "./") => {

    if (!isExtensionValid(extension)) throw new Error("extension is not valid");

    return wsd
        .diagram(diagramSource, "default", extension)
        .then((result) => result[0])
        .then((buf) => writeFile(`${outputDir}/${diagramSource.match(regexDiagramTitle)[1]}.${extension}`, buf));
};

const notEmptyString = line => line && line.replace(regexEmptyLines, "").length;

const addTitle = line => `title ${line}`;

// TODO: Add more chars to ignore if needed with regex
const ignoreComments = line => !line.trimLeft().startsWith("#");


(async () => {

    program
        .command('generate <input>')
        .option('-e, --extension <type>', 'image extension')
        .option('-o, --output-dir <name>', 'output directory to save images')
        .action(async input => {

            try {
                bar.start(100, 0);

                const file = await readFile(input);

                bar.update(50);

                const diagramFiles = file
                    .toString()
                    .split(regexSplitDiagrams)
                    .filter(notEmptyString)
                    .filter(ignoreComments)
                    .map(addTitle)
                    .map(stream => buildDiagram(stream, program.extension, program.outputDir));

                await Promise.all(diagramFiles);

                bar.update(50);
            } catch (e) {
                process.stderr.write(`\n Error: ${e.message}`);
            } 

            bar.stop();
        });

    await program.parseAsync(process.argv);
})()


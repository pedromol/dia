#!/usr/bin/env node

const wsd = require("websequencediagrams");
const fs = require("fs");
const util = require("util");
const { Command } = require("commander");

const program = new Command();

program.version('0.0.2', '-v, --version', 'output the current version');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const regexSplitDiagrams = /(^|\r|\n)title[ \t]+/g;
const regexEmptyLines = /[ \t\r\n]+/g;
const regexDiagramTitle = /^title[ \t]+([^\r\n]+)/;

const extensions = ['png', 'jpeg', 'jpg'];

const isExtensionValid = ext => extensions.find(e => e === ext) ? true : false;

const buildDiagram = async (diagramSource, extension = "png", outputDir = "./") => {

  if (!isExtensionValid(extension)) throw new Error("extension is not valid");

  return wsd
    .diagram(diagramSource, "default", extension)
    .then((result) => result[0])
    .then((buf) => writeFile(`${outputDir}/${diagramSource.match(regexDiagramTitle)[1]}.${extension}`, buf));
};

const notEmptyString = line => line && line.replace(regexEmptyLines, "").length;

const addTitle = line => `title ${line}`;

// TODO: Add more chars to ignore if needed 
const ignoreComments = line => !line.trimLeft().startsWith("#");
    
program
    .command('generate <input>')
    .option('-e, --extension <type>', 'file extension')
    .option('-o, --output-dir <name>', 'output directory to save images')
    .action((input) => {

        readFile(input)
            .then((diagrams) => {
                return Promise.all(
                    diagrams
                    .toString()
                    .split(regexSplitDiagrams)
                    .filter(notEmptyString)
                    .filter(ignoreComments)
                    .map(addTitle)
                    .map((diagram) => buildDiagram(diagram, program.extension, program.outputDir))
                );
            })
            .catch(console.error); 

    });

program.parse(process.argv);


const wsd = require("websequencediagrams");
const fs = require("fs");
const util = require("util");
const { Command } = require("commander");

const program = new Command();

program.version('0.0.1');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const regexSplitDiagrams = /(^|\r|\n)title[ \t]+/g;
const regexEmptyLines = /[ \t\r\n]+/g;
const regexDiagramTitle = /^title[ \t]+([^\r\n]+)/;

const buildDiagram = async (diagramSource, extension = "png") => {
  return wsd
    .diagram(diagramSource, "default", extension)
    .then((result) => result[0])
    .then((buf) => writeFile(`./${diagramSource.match(regexDiagramTitle)[1]}.${extension}`, buf));
};

const notEmptyString = (line) => line && line.replace(regexEmptyLines, "").length;

const addTitle = (newLine) => `title ${newLine}`;

program
    .command('sequence <input>')
    .option('-e, --extension <type>', 'file extension')
    .action((input) => {

         readFile(input).then((diagrams) => {
            return Promise.all(
                diagrams
                .toString()
                .split(regexSplitDiagrams)
                .filter(notEmptyString)
                .map(addTitle)
                .map((diagram) => buildDiagram(diagram, program.extension))
            );
        }); 

    });

program.parse(process.argv);


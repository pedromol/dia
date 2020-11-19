const wsd = require("websequencediagrams");
const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const outputFormat = "png";

const regexSplitDiagrams = /(^|\r|\n)title[ \t]+/g;
const regexEmptyLines = /[ \t\r\n]+/g;
const regexDiagramTitle = /^title[ \t]+([^\r\n]+)/;

const inputFile = "./sequence.diagrams";
const outputDirectory = "./output";

const buildDiagram = async (diagramSource) => {
  return wsd
    .diagram(diagramSource, "default", outputFormat)
    .then((result) => result[0])
    .then((buf) => writeFile(`${outputDirectory}/${diagramSource.match(regexDiagramTitle)[1]}.${outputFormat}`, buf));
};

const notEmptyString = (line) => {
  return line && line.replace(regexEmptyLines, "").length;
};

const addTitle = (newLine) => {
  return `title ${newLine}`;
};

readFile(inputFile).then((diagrams) => {
  return Promise.all(
    diagrams
    .toString()
    .split(regexSplitDiagrams)
    .filter(notEmptyString)
    .map(addTitle)
    .map(buildDiagram)
  );
});

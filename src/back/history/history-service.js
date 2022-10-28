const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const { search } = require('../search/search-service');
const { commands } = require('../config-load');
const { SEARCH_LEVEL } = require('../search/search-model');

const HISTORIC_PATH = path.join(homedir, '.ualthhi');

if (!fs.existsSync(HISTORIC_PATH)) {
    fs.closeSync(fs.openSync(HISTORIC_PATH, 'w'));
}

const historic = (fileName => {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf-8')
            .split('\n')
            .filter(hasContent => hasContent)
            .reduce((historic, line) => {
                console.log(line);
                const matches = line.match(/^([^\s]+?):(.*)$/);
                if (matches?.length ?? 0 === 3) {
                    historic.set(matches[1], matches[2]);
                }
                return historic;
            }, new Map());
    }
    return new Map();
})(HISTORIC_PATH);


function saveFile() {
    const content = [...historic.entries()]
        .map(entry => entry.join(':'))
        .join('\n');

    fs.writeFile(HISTORIC_PATH, content, 'utf-8', err => {
        if (err) console.error(err);
    });
}

module.exports.saveHistory = ({ id }, input) => {
    if (historic.has(id)) {
        historic.delete(id);
    }
    historic.set(id, input);

    while (historic.size > 100) {
        historic.delete(historic.keys().next().value);
    }

    saveFile();
};

module.exports.searchHistory = input => {
    return [...historic.entries()]
        .map(([key, value], idx) => ({ value: commands.find(command => command.id === key), input: value, priority: idx }))
        .filter(({value:exists}) => exists)
        .map(command => {
            command.match = command.value.match(input);
            return command;
        })
        .filter(command => command.match.level !== SEARCH_LEVEL.NOT_FOUND);
};
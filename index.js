const fs = require('fs')
const util = require('util');
const colors = require('ansi-256-colors');

const stringHashCode = (str) => {
	let hash = 0, i, chr;
	if (str.length === 0) 
		return hash;
	for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

module.exports = (options = {}) => {
	let logFile;
	if(options.logFile) {
		logFile = fs.createWriteStream(options.logFile, {flags : 'w'});
	} else if (options.logFile !== false && fs.existsSync('./package.json')) {
		const packageJson = require('./package.json');
		const projectName = packageJson.name;
		logFile = fs.createWriteStream(`${projectName}.log`, {flags : 'w'});
	}

	global.logT = (type, ...d) => {
		const date = (new Date).toLocaleTimeString();
		(options.stdout || console.log)(colors.fg.codes[Math.abs(stringHashCode(type)) % 256] + `[${type}]` + colors.reset + ' ' + util.format(...d));
		if (logFile)
			logFile.write(`[${date}] ` + util.format(...d) + '\n');
	}

	global.logTW = (type, ...d) => {
		const date = (new Date).toLocaleTimeString();
		(options.stdout || console.warn)(colors.fg.codes[Math.abs(stringHashCode(type)) % 256] + `[${type}]` + colors.reset + ' ' + colors.fg.codes[11] + util.format(...d) + colors.reset);
		if (logFile)
			logFile.write(`[${date}] [WARN] ` + util.format(...d) + '\n');
	}

	global.logTE = (type, ...d) => {
		const date = (new Date).toLocaleTimeString();
		(options.stdout || console.error)(colors.fg.codes[Math.abs(stringHashCode(type)) % 256] + `[${type}]` + colors.reset + ' ' + colors.fg.codes[9] + util.format(...d) + colors.reset);
		if (logFile)
			logFile.write(`[${date}] [ERROR] ` + util.format(...d) + '\n');
	}

	if(options.overrideConsole) {
		const logPrint = console.log.bind(console);
		console.log = (...d) => {
			const date = (new Date).toLocaleTimeString();
			(options.stdout || logPrint)(util.format(...d));
			if (logFile)
				logFile.write(`[${date}] ` + util.format(...d) + '\n');
		};
	}
}

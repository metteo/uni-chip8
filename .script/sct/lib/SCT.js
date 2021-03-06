// ---------------------------------------------------------------------------------------------------------------------
// Copyright (C) 2019 Ethan Pini <contact@eth-p.dev>
// MIT License
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Lib: SCT
// The standard library used for the SCT tool.
// ---------------------------------------------------------------------------------------------------------------------
'use strict';

// Libraries.
const findup = require('find-up');
const fs     = require('fs-extra');
const path   = require('path');
const yaml   = require('js-yaml');

// Modules.
const SCTError = require('./SCTError');

// ---------------------------------------------------------------------------------------------------------------------
// Class:
// ---------------------------------------------------------------------------------------------------------------------

let project  = null;
let commands = [];

/**
 * The standard library used for the SCT tool.
 * @type {SCT}
 */
module.exports = class SCT {

	/**
	 * Get the current project.
	 * @returns {Project}
	 */
	static async getProject() {
		if (project !== null) return project;

		let {dir, config} = await (async () => {
			let fileJSON = findup('project.json', {cwd: __dirname});
			let fileYAML = findup('project.yml', {cwd: __dirname});
			let file;
			let config = null;
			let dir = null;

			if ((file = await fileYAML) != null) {
				config = yaml.safeLoad(await fs.readFile(file, 'utf8'));
				dir = path.dirname(file);
			} else if ((file = await fileJSON) != null) {
				config = JSON.parse(await fs.readFile(file, 'utf8'));
				dir = path.dirname(file);
			} else {
				throw new SCTError("couldn't find project.json or project.yml");
			}

			return {
				config,
				dir
			};
		})();

		project = new this.Project(dir, config);
		await project._load();
		return project;
	}

	/**
	 * Get the directory to the SCT folder.
	 * @returns {String}
	 */
	static getDirectory() {
		return path.dirname(__dirname);
	}

	/**
	 * Gets a subcommand class.
	 *
	 * @param command {String} The command.
	 * @returns {Promise<Command>}
	 */
	static async getCommand(command) {
		// Validate subcommand name.
		if (!/^[a-z0-9@]+$/.test(command)) {
			throw new SCTError(`Unknown subcommand: ${command}`, {
				message: `'${command}' is not a sct command.`
			});
		}

		// Use cached copy.
		let commandClass = commands[command];
		if (commandClass != null) return commandClass;

		// Check if it exists.
		let commandPath = path.join(SCT.getDirectory(), 'cmd', `sct-${command}.js`);
		if (!await fs.pathExists(commandPath)) {
			throw new SCTError(`Unknown subcommand: ${command}`, {
				message: `'${command}' is not a sct command.`
			});
		}

		// Use require'd copy.
		commandClass = require(commandPath);
		if (Object.getPrototypeOf(commandClass) !== this.Command) {
			throw new SCTError(`Unknown subcommand: ${command}`, {
				message: `'${command}' is not a sct command.`
			});
		}

		// Return.
		commands[command] = commandClass;
		return commandClass;
	}

};

// ---------------------------------------------------------------------------------------------------------------------
// Exports:
// ---------------------------------------------------------------------------------------------------------------------

module.exports.AsyncTransform          = require('./AsyncTransform');
module.exports.Child                   = require('./Child');
module.exports.Command                 = require('./Command');
module.exports.CommandUtil             = require('./CommandUtil');
module.exports.CommandError            = require('./CommandError');
module.exports.CommandRunner           = require('./CommandRunner');
module.exports.GitUtil                 = require('./GitUtil');
module.exports.Project                 = require('./Project');
module.exports.FileChecker             = require('./FileChecker');
module.exports.FileFormatter           = require('./FileFormatter');
module.exports.Finder                  = require('./Finder');
module.exports.FinderFilter            = require('./FinderFilter');
module.exports.FinderFilterGit         = require('./FinderFilterGit');
module.exports.FinderFilterGitModified = require('./FinderFilterGitModified');
module.exports.FinderFilterGitStaged   = require('./FinderFilterGitStaged');
module.exports.SCT                     = module.exports;
module.exports.SCTError                = require('./SCTError');
module.exports.StreamUtil              = require('./StreamUtil');
module.exports.Task                    = require('./Task');
module.exports.TaskLogger              = require('./TaskLogger');
module.exports.TaskLoggerPretty        = require('./TaskLoggerPretty');
module.exports.TaskRunner              = require('./TaskRunner');
module.exports.TaskStatus              = require('./TaskStatus');

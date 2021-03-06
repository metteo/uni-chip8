// ---------------------------------------------------------------------------------------------------------------------
// Copyright (C) 2019 Ethan Pini <contact@eth-p.dev>
// MIT License
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Lib: TaskPug
// A gulp task generator to build HTML files from Pug templates.
// ---------------------------------------------------------------------------------------------------------------------
'use strict';

// Modules.
const Task = require('@sct').Task;

// ---------------------------------------------------------------------------------------------------------------------
// Generator:
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Generates an asset copying gulp task for a module.
 *
 * @param module    {Module} The module.
 * @param [options] {Object} The build options.
 */
module.exports = class TaskCopy extends Task {

	get id() {
		return 'copy';
	}

	get description() {
		return 'Copies module assets/library files.'
	}

	/**
	 * @override
	 */
	_run(logger, options) {
		let target   = options.release ? 'release' : 'debug';
		let module  = this.module;
		let project = this.module.getProject();

		// Stream.
		return this._gulpsrc(null, {patterns: Object.keys(this.module.getCopyPatterns())})
			.pipe(this._gulpstrip(Object.entries(this.module.getCopyPatterns()).map(([k, v]) => ({[k]: v}))))
			.pipe(this._gulpdest(options))
	}

};


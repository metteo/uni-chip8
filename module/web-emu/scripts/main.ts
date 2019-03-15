//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import app_ready from '@chipotle/web/app_ready';

import App from './noveau/App';

import DialogController from './noveau/controller/DialogController';
import EmulatorController from './noveau/controller/EmulatorController';
import EmulatorButtonController from './noveau/controller/EmulatorButtonController';
import EmulatorFeedbackController from './noveau/controller/EmulatorFeedbackController';
import KeybindController from './noveau/controller/KeybindController';
import TriggerController from './noveau/controller/TriggerController';
import VisibilityController from './noveau/controller/VisibilityController';

import ErrorDialog from './noveau/dialog/error/ErrorDialog';
import LoadDialog from './noveau/dialog/load/LoadDialog';
import SavestatesDialog from './noveau/dialog/savestates/SavestateDialog';
import SettingsDialog from './noveau/dialog/settings/SettingsDialog';

import KeypadVisualizer from './noveau/visualizer/keypad/KeypadVisualizer';
import ProgramVisualizer from './noveau/visualizer/program/ProgramVisualizer';
import RegisterVisualizer from './noveau/visualizer/register/RegisterVisualizer';
import ScreenVisualizer from './noveau/visualizer/screen/ScreenVisualizer';
import StackVisualizer from './noveau/visualizer/stack/StackVisualizer';

// ---------------------------------------------------------------------------------------------------------------------
// Initialize UI:
// ---------------------------------------------------------------------------------------------------------------------
(<any>window).Chipotle = App;

// ---------------------------------------------------------------------------------------------------------------------
// Initialize App:
// ---------------------------------------------------------------------------------------------------------------------
App.settings.suppressListeners('update', true);

App.addListener('ready', () => {
	App.settings.suppressListeners('update', false);
	App.settings.broadcast();

	app_ready.done();
});

App.depends([
	// Application controllers.
	KeybindController,
	EmulatorController,
	TriggerController,
	EmulatorButtonController,
	EmulatorFeedbackController,
	DialogController,
	VisibilityController,

	// Dialog controllers.
	ErrorDialog,
	LoadDialog,
	SavestatesDialog,
	SettingsDialog,

	// Visualizers.
	KeypadVisualizer,
	ProgramVisualizer,
	RegisterVisualizer,
	ScreenVisualizer,
	StackVisualizer
]);

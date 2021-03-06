//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import App from './App';
import AppSettings from './AppSettings';

// ---------------------------------------------------------------------------------------------------------------------

/**
 * An abstract class that specifies handler functions for keybinds.
 */
abstract class Keybind {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The name of the setting for the keybind.
	 */
	public readonly setting: AppSettings.Keys;

	// -------------------------------------------------------------------------------------------------------------
	// | Constructors:                                                                                             |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Creates a new keybind handler.
	 * @param setting The setting associated with the keybind key.
	 */
	public constructor(setting: AppSettings.Keys) {
		this.setting = setting;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Getters:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The name of the bound key.
	 */
	public get key(): string {
		return App.settings.get(<any>this.setting);
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Abstract:                                                                                                 |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Called when the key is pressed.
	 */
	public abstract onKeyDown(): void;

	/**
	 * Called when the key is released.
	 */
	public onKeyUp(): void {}
}

// ---------------------------------------------------------------------------------------------------------------------
export default Keybind;
export {Keybind};

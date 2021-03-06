//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import App from '../App';
import Keybind from '../Keybind';
import KeybindPause from '../keybind/KeybindPause';
import KeybindTurbo from '../keybind/KeybindTurbo';
import KeybindStepForwards from '../keybind/KeybindStepForwards';
import KeybindStepBackwards from '../keybind/KeybindStepBackwards';
import KeybindGamepad from '../keybind/KeybindGamepad';
import KeybindQuicksave from '../keybind/KeybindQuicksave';
import KeybindQuickload from '../keybind/KeybindQuickload';

// ---------------------------------------------------------------------------------------------------------------------

/**
 * The class that handles global (page) keybinds.
 */
class KeybindController extends App {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	private handlerList: Keybind[];
	private handlerMap: Map<String, Keybind>;

	// -------------------------------------------------------------------------------------------------------------
	// | Constructors:                                                                                             |
	// -------------------------------------------------------------------------------------------------------------

	public constructor() {
		super();

		this.handlerMap = new Map();
		this.handlerList = [
			new KeybindPause('keybind_control_pause'),
			new KeybindTurbo('keybind_control_turbo'),
			new KeybindStepForwards('keybind_control_step_next'),
			new KeybindStepBackwards('keybind_control_step_prev'),
			new KeybindQuicksave('keybind_control_quicksave'),
			new KeybindQuickload('keybind_control_quickload'),

			// Keypad:
			...[0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]
				.map(n => n.toString(16).toUpperCase())
				.map(n => new KeybindGamepad(<any>`keybind_key_${n}`, n))
		];

		this.rebuildHandlerMap();
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Hooks:                                                                                                    |
	// -------------------------------------------------------------------------------------------------------------

	protected initDOM(this: App.Fragment<this>): void {
		window.addEventListener('keydown', evt => {
			if (!this.state.emulator.keybind.value) return;
			if (!this.onKeyDown(evt)) {
				evt.preventDefault();
				evt.stopPropagation();
			}
		});

		window.addEventListener('keyup', evt => {
			if (!this.state.emulator.keybind.value) return;
			if (!this.onKeyUp(evt)) {
				evt.preventDefault();
				evt.stopPropagation();
			}
		});

		this.settings.addListener('update', setting => {
			if (!setting.startsWith('keybind_')) return;
			this.rebuildHandlerMap();
		});
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Handlers:                                                                                                 |
	// -------------------------------------------------------------------------------------------------------------

	protected onKeyDown(event: KeyboardEvent): boolean {
		if (this.shouldIgnore(event)) return true;
		let handler = this.handlerMap.get(event.key);
		if (handler == null) return true;
		handler.onKeyDown();
		return false;
	}

	protected onKeyUp(event: KeyboardEvent): boolean {
		if (this.shouldIgnore(event)) return true;
		let handler = this.handlerMap.get(event.key);
		if (handler == null) return true;
		handler.onKeyUp();
		return false;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Methods:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Checks if the key event should be ignored.
	 * Keybinds will be ignored when the user is focusing an input element, for example.
	 *
	 * @param event The event to check.
	 * @returns True if the event should be left alone.
	 */
	protected shouldIgnore(event: KeyboardEvent): boolean {
		if (event.target instanceof HTMLInputElement && event.target.type !== 'button') return true;
		if (event.metaKey || event.ctrlKey || event.altKey) return true;
		return false;
	}

	/**
	 * Iterates through the keybind handler list and generates a mapping for quick lookup.
	 */
	protected rebuildHandlerMap(): void {
		this.handlerMap.clear();

		for (let handler of this.handlerList) {
			let key = handler.key;

			if (this.handlerMap.has(key)) console.warn(`Key '${key}' is requested by multiple handlers.`);
			this.handlerMap.set(key, handler);
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------
export default KeybindController;
export {KeybindController};

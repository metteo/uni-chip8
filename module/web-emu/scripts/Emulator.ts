//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import Emitter from '@chipotle/types/Emitter';

import VMContext from '@chipotle/vm/VMContext';
import VMSnapshot from '@chipotle/vm/VMSnapshot';

import Chip from '@chipotle/chip-arch/Chip';

import StateProvider from '@chipotle/wfw/StateProvider';

// ---------------------------------------------------------------------------------------------------------------------
// Emulator:
// ---------------------------------------------------------------------------------------------------------------------

/**
 * The emulator implementation.
 * Emits the following events:
 *
 * - `keyup`
 * - `keydown`
 * - `pause`
 * - `resume`
 * - `load`
 * - `error`
 * - `snapshot`
 */
class Emulator extends Emitter<
	'error' | 'load' | 'pause' | 'resume' | 'reset' | 'step' | 'snapshot' | 'keydown' | 'keyup'
> {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The virtual machine instance.
	 */
	public readonly vm: VMContext<Chip>;

	/**
	 * Whether or not the emulator is paused.
	 */
	protected paused: boolean;

	/**
	 * Whether or not the emulator is in turbo mode.
	 */
	protected turbo: boolean;

	/**
	 * The setInterval timer ID for calling update.
	 */
	protected interval: any | null;

	/**
	 * The update interval rate.
	 */
	protected intervalRate: number;

	/**
	 * A fraction of missed frames caused by differing clock cycles.
	 */
	protected intervalMiss: number;

	/**
	 * The frequency to run the VM at.
	 * i.e. The number of instructions / second.
	 */
	protected speed: number;

	/**
	 * The last time (in milliseconds) update() was called.
	 */
	protected lastUpdate: number;

	/**
	 * The last error that occurred when executing the program.
	 */
	protected lastError?: Error;

	/**
	 * A state provider for checking if the emulator has encountered an error.
	 */
	protected errored: StateProvider<boolean>;

	// -------------------------------------------------------------------------------------------------------------
	// | Constructor:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Creates a new emulator.
	 * @param vm The software virtual machine.
	 */
	public constructor(vm: VMContext<Chip>) {
		super();

		this.vm = vm;
		this.speed = vm.CLOCK_SPEED;
		this.paused = true;
		this.interval = null;
		this.intervalRate = 10;
		this.intervalMiss = 0;
		this.lastUpdate = Date.now();
		this.errored = new StateProvider<boolean>(false);
		this.turbo = false;
		this._update = this._update.bind(this);

		this.vm.addListener('restore', (...args) => this.emit('load', ...args));
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Methods:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Loads a program into the emulator.
	 * @param data The data to load.
	 */
	public async load(data: Uint8Array) {
		await this.vm.program.load(data);
		this.reset();
		this.emit('load');
	}

	/**
	 * Pauses the emulator.
	 */
	public pause(): void {
		if (this.paused) return;
		this.paused = true;

		// Reset timers.
		if (this.interval != null) clearInterval(this.interval);
		this.emit('pause');
	}

	/**
	 * Resumes the emulator.
	 */
	public resume(): void {
		if (!this.paused) return;
		if (this.vm.program.data == null) return;

		this.lastUpdate = Date.now();
		this.paused = false;
		this.interval = setInterval(this._update, this.intervalRate);
		this.emit('resume');
	}

	/**
	 * Resets the emulator.
	 */
	public reset(): void {
		try {
			this.lastError = undefined;
			this.errored.value = false;
			this.vm.reset();
			this.emit('reset');
			this.lastUpdate = Date.now();
		} catch (ex) {
			this._error(ex);
		}
	}

	/**
	 * Steps the emulator forwards by one instruction.
	 */
	public stepForwards(): void {
		try {
			this.vm.step();
			this.emit('step');
			this.lastUpdate = Date.now();
		} catch (ex) {
			this._error(ex);
		}
	}

	/**
	 * Creates a snapshot of the emulator state.
	 *
	 * @param id The snapshot ID, passed to any event listeners.
	 *
	 * @returns The snapshot object.
	 */
	public snapshot(id?: string): VMSnapshot {
		return this.vm.snapshot();
	}

	/**
	 * Restores a snapshot of the emulator state.
	 *
	 * @param snapshot The snapshot object.
	 * @throws VMError When the snapshot is invalid.
	 */
	public restore(snapshot: VMSnapshot): void {
		this.vm.restore(snapshot);
	}

	/**
	 * Steps the emulator backwards by one instruction.
	 */
	public stepBackwards(): void {
		// TODO: Unimplemented.
		this.emit('step');
		this._error(new Error('UNIMPLEMENTED.'));
	}

	/**
	 * Notifies the emulator of a keydown event.
	 * @param key The key (0-9, A-F) pressed.
	 */
	public keydown(key: string): void {
		let keyid = `KEY_${key.toUpperCase()}`;
		if ((<any>this.vm.keyboard)[keyid] === true) {
			return;
		}

		this.emit('keydown', key);
		this.vm.emit('input', key);
		(<any>this.vm.keyboard)[keyid] = true;
	}

	/**
	 * Notifies the emulator of a keyup event.
	 * @param key The key (0-9, A-F) pressed.
	 */
	public keyup(key: string): void {
		let keyid = `KEY_${key.toUpperCase()}`;
		if ((<any>this.vm.keyboard)[keyid] === false) {
			return;
		}

		this.emit('keyup', key);
		(<any>this.vm.keyboard)[keyid] = false;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Getters:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Gets the pause state of the emulator.
	 * @returns True if the emulator is paused.
	 */
	public isPaused(): boolean {
		return this.paused;
	}

	/**
	 * Gets the turbo state of the emulator.
	 * @returns True if the emulator is in turbo mode.
	 */
	public isTurbo(): boolean {
		return this.turbo;
	}

	/**
	 * Gets the error state provider of the emulator.
	 * @returns True if the emulator encountered an error at some point since the last reset.
	 */
	public getErrorState(): StateProvider<boolean> {
		return this.errored;
	}

	/**
	 * Gets the last reported error.
	 * @returns The last reported error, or null.
	 */
	public getError(): Error | null {
		return this.lastError || null;
	}

	/**
	 * Gets the CPU frequency of the emulator.
	 * @returns The frequency in cycles per second.
	 */
	public getFrequency(): number {
		return this.speed;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Setters:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Sets the CPU frequency of the emulator.
	 * @param frequency The frequency.
	 */
	public setFrequency(frequency: number): void {
		this.vm.getTimerInstances().forEach(timer => timer.adjust(frequency, this.vm.TIMER_SPEED));
		this.speed = frequency;
	}

	/**
	 * Sets the enabled state of turbo mode.
	 * @param enabled True if turbo should be enabled.
	 */
	public setTurbo(enabled: boolean): void {
		this.turbo = enabled;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Internal:                                                                                                 |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Halts execution and emits an error.
	 * @param exception The error.
	 * @throws The error.
	 * @internal
	 */
	protected _error(exception: Error) {
		this.lastError = exception;
		this.errored.value = true;
		this.pause();
		this.emit('error', exception);
		throw exception;
	}

	/**
	 * Framerate-independent update.
	 * This will try and catch up on missed cycles.
	 *
	 * @internal
	 */
	protected _update() {
		let now = Date.now();
		let ms = now - this.lastUpdate;
		let ideal = this.speed / (1000 / this.intervalRate);

		/** The number of ticks to execute. */
		let ticks;

		if (this.turbo) {
			ticks = 3 * (this.speed / (1000 / this.intervalRate));
		} else {
			ticks = this.speed / (1000 / ms) + this.intervalMiss;
			this.intervalMiss = ticks % 1;
			ticks |= 0;
		}

		// Safety.
		if (!this.turbo && ticks > ideal * 2) {
			console.warn(`Emulator: Behind by ${ticks - ideal} cycles.`);
			ticks = ideal;
		}

		// Execute.
		try {
			for (let i = 0; i < ticks; i++) {
				this.vm.step();
			}
		} catch (ex) {
			this._error(ex);
		}

		// Set lastUpdate.
		this.lastUpdate = Date.now();
	}
}

// ---------------------------------------------------------------------------------------------------------------------
export default Emulator;
export {Emulator};

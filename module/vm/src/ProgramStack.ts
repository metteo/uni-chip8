//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import assert from '@chipotle/types/assert';

import ProgramAddress from './ProgramAddress';
import ProgramError from './ProgramError';
import JsonType from '@chipotle/types/JsonType';
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A program's call stack.
 */
export default class ProgramStack {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The stack.
	 */
	protected stack: ProgramAddress[];

	/**
	 * The maximum size of the stack.
	 */
	public readonly MAX: number;

	// -------------------------------------------------------------------------------------------------------------
	// | Constructor:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Initializes the call stack.
	 *
	 * @param max The maximum size of the stack.
	 */
	public constructor(max: number) {
		assert(max > 0, "Parameter 'max' is less than 1");

		this.stack = [];
		this.MAX = max;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Methods:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Push an address to the call stack.
	 * @param address The address to push.
	 */
	push(address: ProgramAddress): void {
		if (this.stack.length === this.MAX) throw new ProgramError(ProgramError.STACK_OVERFLOW);
		this.stack.push(address);
	}

	/**
	 * Pops an address from the call stack.
	 * @throws ProgramError When the stack is empty.
	 */
	pop(): ProgramAddress {
		if (this.stack.length === 0) throw new ProgramError(ProgramError.STACK_UNDERFLOW);
		return <ProgramAddress>this.stack.pop();
	}

	/**
	 * Get the top address on the call stack.
	 * @throws ProgramError When the stack is empty.
	 * @returns Top address from the call stack.
	 */
	top(): ProgramAddress {
		if (this.stack.length === 0) throw new ProgramError(ProgramError.STACK_UNDERFLOW);
		return <ProgramAddress>this.stack[this.stack.length - 1];
	}

	/**
	 * Clears the call stack.
	 * THIS SHOULD ONLY BE USED FOR RESETTING THE PROGRAM!
	 */
	clear(): void {
		this.stack = [];
	}

	/**
	 * Returns an exact as-is copy of the program stack.
	 * @returns The program stack.
	 */
	inspect(): ProgramAddress[] {
		return this.stack.slice(0);
	}

	/**
	 * Creates a JSON-compatible snapshot of the stack.
	 * @returns A snapshot of the stack.
	 */
	public snapshot(): JsonType {
		return {
			stack: this.stack.slice(0),
			max: this.MAX
		};
	}

	/**
	 * Restores a snapshot of the stack.
	 * @param snapshot The JSON-compatible snapshot.
	 */
	public restore(snapshot: any) {
		this.stack = snapshot.stack.slice(0);
		(<any>this).MAX = snapshot.max;
	}
}

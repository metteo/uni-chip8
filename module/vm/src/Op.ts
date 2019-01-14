// ---------------------------------------------------------------------------------------------------------------------
// Copyright (C) 2019 Team Chipotle
// MIT License
// ---------------------------------------------------------------------------------------------------------------------
import assert from '@chipotle/debug/assert';

import Architecture from './Architecture';
import {default as OpCode, and, isValid} from './OpCode';
import OpMask from './OpMask';
import IR from './IR';
import VMContext from './VMContext';
// ---------------------------------------------------------------------------------------------------------------------

/**
 * An executable instruction (operation).
 */
export default abstract class Op<A extends Architecture> {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The instruction's opcode.
	 */
	public readonly opcode: OpCode;

	/**
	 * The instruction's opcode mask.
	 */
	public readonly mask: OpMask;

	// -------------------------------------------------------------------------------------------------------------
	// | Constructor:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Initializes the instruction.
	 *
	 * @param opcode The instruction opcode.
	 *               Parameters should be replaced with zeros.
	 *
	 * @param mask The instruction opcode mask.
	 */
	constructor(opcode: OpCode, mask: OpMask) {
		assert(opcode != null, "Parameter 'opcode' is null");
		assert(mask != null, "Parameter 'mask' is null");
		assert(isValid(opcode), "Parameter 'opcode' is out of range for OpCode");

		this.opcode = opcode;
		this.mask = mask;

		// Create reference back to this (for IR).
		(<any>this.execute).op = this;
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Methods:                                                                                                  |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Checks to see if the opcode is for the instruction.
	 *
	 * @param opcode The opcode to check.
	 * @returns True if the opcode is for the instruction.
	 */
	matches(opcode: OpCode): boolean {
		return and(this.mask.mask, opcode) === this.opcode;
	}

	/**
	 * Decodes the opcode into an IR.
	 * @param opcode The opcode to decode.
	 */
	decode(opcode: OpCode): IR<A> {
		return [<any>this.execute, this.mask.decodeParameter1(opcode), this.mask.decodeParameter2(opcode)];
	}

	/**
	 * Executes the instruction.
	 *
	 * @param context The virtual machine context.
	 * @param p1 The first parameter.
	 * @param p2 The second parameter.
	 */
	abstract execute(context: VMContext<A>, p1: OpCode, p2: OpCode): void;

	// TODO: [Reverse-Debugging] reverse(ir: IR, trace: TraceFrame)
	// TODO: [Reverse-Debugging] trace(ir: IR)
}

//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import ISA from './ISA';
import Op from './Op';
import ProgramSource from './ProgramSource';
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A computer architecture.
 * This class represents the available components and instruction set of a specific computer.
 */
export default abstract class Architecture<A> {
	// -------------------------------------------------------------------------------------------------------------
	// | Fields:                                                                                                   |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * The instruction set.
	 */
	public readonly isa: Op<A>[];

	// -------------------------------------------------------------------------------------------------------------
	// | Constructor:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Creates a new computer architecture.
	 * @param isa The instruction set of the architecture.
	 */
	protected constructor(isa: ISA<A>) {
		this.isa = isa.map(op => new op());
	}

	// -------------------------------------------------------------------------------------------------------------
	// | Methods:                                                                                              |
	// -------------------------------------------------------------------------------------------------------------

	/**
	 * Loads a program from a program source.
	 * This method can also be used to reinitialize hardware.
	 *
	 * @returns The loaded program, or false if there's no way to load the program.
	 */
	protected abstract async _load(source: ProgramSource): Promise<Uint8Array | false>;
}
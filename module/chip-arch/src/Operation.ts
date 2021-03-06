//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import Uint16 from '@chipotle/types/Uint16';

import Interpreted from '@chipotle/vm/Interpreted';
import VMContext from '@chipotle/vm/VMContext';

import ISA_Operation from '@chipotle/isa/Operation';

import Chip from './Chip';

// ---------------------------------------------------------------------------------------------------------------------

/**
 * An instruction set {@link ISA_Operation operation} that can be {@link Interpreted interpreted} by the virtual
 * machine.
 */
abstract class Operation extends ISA_Operation implements Interpreted<Chip> {
	/**
	 * @inheritDoc
	 */
	public abstract execute(this: void, context: Operation.Context, operands: Uint16[]): void;
}

namespace Operation {
	/**
	 * An alias for {@link VMContext}<{@link Chip}>.
	 */
	export type Context = VMContext<Chip>;
}

// ---------------------------------------------------------------------------------------------------------------------
type Context = Operation.Context;
export default Operation;
export {Operation, Context};

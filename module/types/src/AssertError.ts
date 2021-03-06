//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import ErrorChain from './ErrorChain';
//! --------------------------------------------------------------------------------------------------------------------

/**
 * An error thrown when an assertion fails.
 */
class AssertError extends ErrorChain {}

// ---------------------------------------------------------------------------------------------------------------------
export default AssertError;
export {AssertError};

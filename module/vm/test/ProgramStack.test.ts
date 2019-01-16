//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------
import ProgramStack from '../src/ProgramStack';
// ---------------------------------------------------------------------------------------------------------------------
describe('ProgramStack', () => {
	it('constructor', () => {
		let stack = new ProgramStack(3);
	});

	it('push', () => {
		let stack = new ProgramStack(3);
		expect(() => stack.push(1)).not.toThrow();
		expect(() => stack.push(3)).not.toThrow();
		expect(() => stack.push(5)).not.toThrow();
		expect(() => stack.push(9)).toThrow();
		expect(stack.inspect()).toEqual([1, 3, 5]);
	});

	it('pop', () => {
		let stack = new ProgramStack(1);
		stack.push(5);
		expect(stack.pop()).toEqual(5);
		expect(() => stack.pop()).toThrow();
	});

	it('inspect', () => {
		let stack = new ProgramStack(1);
		stack.push(5);
		expect(stack.inspect()).toEqual([5]);
		stack.inspect()[0] = 1;
		expect(stack.inspect()).toEqual([5]);
	});
});
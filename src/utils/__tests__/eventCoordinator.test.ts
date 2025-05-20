import { EventCoordinator } from '../eventCoordinator';

// Mock console methods to prevent test output clutter
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('EventCoordinator', () => {
  beforeEach(() => {
    // Clear any events from previous tests
    EventCoordinator.clear();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  test('processes events in sequence', async () => {
    const results: number[] = [];
    
    // Add events in reverse order to verify sequencing
    EventCoordinator.enqueue('third', () => { results.push(3); });
    EventCoordinator.enqueue('second', () => { results.push(2); });
    EventCoordinator.enqueue('first', () => { results.push(1); });
    
    // Allow events to process
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(results).toEqual([1, 2, 3]);
  });
  
  test('handles event cancellation', async () => {
    const results: number[] = [];
    
    EventCoordinator.enqueue('first', () => { results.push(1); });
    const secondId = EventCoordinator.enqueue('second', () => { results.push(2); });
    EventCoordinator.enqueue('third', () => { results.push(3); });
    
    // Cancel the second event
    EventCoordinator.cancel(secondId);
    
    // Allow events to process
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(results).toEqual([1, 3]);
  });
  
  test('handles errors gracefully', async () => {
    const results: number[] = [];
    
    EventCoordinator.enqueue('first', () => { results.push(1); });
    EventCoordinator.enqueue('error', () => { throw new Error('Test error'); });
    EventCoordinator.enqueue('third', () => { results.push(3); });
    
    // Allow events to process
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Third event should still run despite error in second
    expect(results).toEqual([1, 3]);
    expect(console.error).toHaveBeenCalled();
  });
  
  test('clear removes all pending events', async () => {
    const results: number[] = [];
    
    EventCoordinator.enqueue('first', () => { results.push(1); });
    EventCoordinator.enqueue('second', () => { results.push(2); });
    
    // Clear the queue before events process
    EventCoordinator.clear();
    
    // Allow time for events to potentially process
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // No events should have executed
    expect(results).toEqual([]);
  });
});
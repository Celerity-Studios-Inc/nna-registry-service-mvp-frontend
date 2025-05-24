# Event Coordinator Implementation

## Overview

The Event Coordinator system manages the sequencing of operations, particularly useful for coordinating state updates that need to happen in a specific order. This addresses a key issue in React applications where state updates may be batched or processed asynchronously, leading to race conditions and unexpected behaviors.

## Features

- Sequential execution of events
- Controlled timing with configurable delays
- Error isolation between events
- Event cancellation
- Complete queue clearing
- Comprehensive logging

## Implementation Details

### Core Components

1. **EventCoordinator Class**
   - Static utility class to maintain a global event queue
   - Methods for enqueueing, cancelling, and clearing events
   - Sequential processing logic with error handling

2. **TaxonomySelector Integration**
   - Enhanced selection handlers (layer, category, subcategory) to use EventCoordinator
   - Cleanup on component unmount
   - Improved error handling and logging

### How It Works

1. **Event Sequencing**
   - Events are added to the queue with a name, callback function, and optional timeout
   - Processing starts immediately when events are added, if not already in progress
   - Events execute in the order they were enqueued
   - Each event completes before the next one starts

2. **Error Handling**
   - Each event is executed within a try/catch block
   - If an event throws an error, it's logged but doesn't prevent subsequent events from running
   - This ensures the event queue continues to process even if individual events fail

3. **Lifecycle Management**
   - The queue is automatically cleared when components using it unmount
   - Events can be cancelled individually using their returned IDs
   - The entire queue can be cleared to reset the state

## Key Improvements

1. **State Update Synchronization**
   - Ensures updates happen in the correct sequence, preventing race conditions
   - Provides controlled timing for operations that depend on previous state updates

2. **Debugging and Traceability**
   - Each event is logged with timing information
   - Events can be tracked through their lifecycle using unique IDs
   - Clear logs show exactly when events are enqueued and executed

3. **Error Resilience**
   - System continues functioning even if individual events fail
   - Prevents cascading failures that could break the entire UI

## Usage Examples

### Basic Event Sequencing

```typescript
// Clear any pending events
EventCoordinator.clear();

// Schedule a sequence of events
EventCoordinator.enqueue('update-ui', () => {
  // Update UI immediately for responsiveness
  setDisplayState({ category: selectedCategory });
});

EventCoordinator.enqueue('update-form', () => {
  // Update underlying form data
  setValue('categoryCode', selectedCategory);
});

EventCoordinator.enqueue('verify', () => {
  // Verify the updates were successful
  const currentValue = getValues('categoryCode');
  console.log(`Verification: current value is ${currentValue}`);
}, 100); // Add a delay for verification
```

### Advanced Usage with Cancellation

```typescript
// Store event IDs for potential cancellation
const updateId = EventCoordinator.enqueue('update-data', updateFunction);
const saveId = EventCoordinator.enqueue('save-data', saveFunction, 500);

// Cancel the save if the user clicks cancel
cancelButton.addEventListener('click', () => {
  EventCoordinator.cancel(saveId);
  console.log('Save operation cancelled');
});
```

## Testing

The EventCoordinator is comprehensively tested to ensure:

1. Events execute in the correct sequence
2. Event cancellation works as expected
3. Error handling prevents cascading failures
4. Queue clearing properly removes all pending events

## Next Steps

1. **Performance Optimization**
   - Monitor and optimize for large event queues
   - Consider priority-based processing for critical events

2. **Enhanced Error Recovery**
   - Add retry mechanisms for failed events
   - Implement customizable error handling strategies

3. **Integration with Redux/Context**
   - Create middleware/hooks for state management integration
   - Provide context-aware event processing
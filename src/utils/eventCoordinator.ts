/**
 * EventCoordinator manages the sequencing of operations, particularly useful
 * for coordinating state updates that need to happen in a specific order.
 */
export class EventCoordinator {
  private static eventQueue: { 
    id: string; 
    name: string; 
    callback: () => void; 
    timeout: number;
    timestamp: number;
  }[] = [];
  
  private static processing = false;
  private static idCounter = 0;

  /**
   * Enqueues an event to be processed in sequence
   * @param name Descriptive name for the event (for logging)
   * @param callback Function to execute
   * @param timeout Optional delay before execution (milliseconds)
   * @returns Event ID that can be used to cancel the event
   */
  static enqueue(name: string, callback: () => void, timeout = 0): string {
    const id = `event_${++this.idCounter}_${Date.now()}`;
    this.eventQueue.push({ 
      id, 
      name, 
      callback, 
      timeout,
      timestamp: Date.now()
    });
    
    console.log(`[EventCoordinator] Enqueued event: ${name} (id: ${id})`);
    
    if (!this.processing) {
      this.processQueue();
    }
    
    return id;
  }

  /**
   * Cancels a pending event by ID
   * @param id Event ID to cancel
   * @returns True if event was found and canceled
   */
  static cancel(id: string): boolean {
    const initialLength = this.eventQueue.length;
    this.eventQueue = this.eventQueue.filter(event => event.id !== id);
    const canceled = initialLength > this.eventQueue.length;
    
    if (canceled) {
      console.log(`[EventCoordinator] Canceled event: ${id}`);
    }
    
    return canceled;
  }

  /**
   * Clears all pending events
   */
  static clear(): void {
    const count = this.eventQueue.length;
    this.eventQueue = [];
    console.log(`[EventCoordinator] Cleared ${count} pending events`);
  }

  /**
   * Processes events in the queue sequentially
   * @private
   */
  private static processQueue(): void {
    if (this.eventQueue.length === 0) {
      this.processing = false;
      console.log('[EventCoordinator] Queue empty, processing complete');
      return;
    }

    this.processing = true;
    const { id, name, callback, timeout, timestamp } = this.eventQueue.shift()!;
    const queueTime = Date.now() - timestamp;
    
    console.log(`[EventCoordinator] Processing event: ${name} (id: ${id}, queued for: ${queueTime}ms)`);
    
    setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`[EventCoordinator] Error in event ${name} (id: ${id}):`, error);
      }
      
      // Process next event in queue
      this.processQueue();
    }, timeout);
  }
}
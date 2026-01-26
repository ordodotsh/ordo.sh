/**
 * Test Helper Utilities
 * 
 * Common helper functions and utilities for testing across the Ordo swarm system.
 * Provides mock data generators, assertion helpers, and test setup utilities.
 */

import { EventEmitter } from 'events';

// Type definitions for test utilities
export interface MockAgent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
  metadata?: Record<string, any>;
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestContext {
  agents: MockAgent[];
  tasks: MockTask[];
  eventBus?: EventEmitter;
}

/**
 * Generate a mock agent with realistic test data
 */
export function createMockAgent(overrides: Partial<MockAgent> = {}): MockAgent {
  const defaultAgent: MockAgent = {
    id: generateId(),
    name: `Agent_${Math.floor(Math.random() * 1000)}`,
    role: 'worker',
    status: 'active',
    capabilities: ['processing', 'communication'],
    metadata: {
      version: '1.0.0',
      lastSeen: new Date().toISOString()
    }
  };

  return { ...defaultAgent, ...overrides };
}

/**
 * Generate a mock task with realistic test data
 */
export function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  const now = new Date();
  const defaultTask: MockTask = {
    id: generateId(),
    title: `Test Task ${Math.floor(Math.random() * 1000)}`,
    description: 'A test task for unit testing',
    priority: 'medium',
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  return { ...defaultTask, ...overrides };
}

/**
 * Create a complete test context with multiple agents and tasks
 */
export function createTestContext(options: {
  agentCount?: number;
  taskCount?: number;
  withEventBus?: boolean;
} = {}): TestContext {
  const { agentCount = 3, taskCount = 5, withEventBus = true } = options;

  const agents = Array.from({ length: agentCount }, () => createMockAgent());
  const tasks = Array.from({ length: taskCount }, () => createMockTask());
  const eventBus = withEventBus ? new EventEmitter() : undefined;

  return { agents, tasks, eventBus };
}

/**
 * Generate a unique ID for testing
 */
export function generateId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Wait for a specified amount of time (useful for async testing)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await sleep(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Mock console methods and capture their output
 */
export class ConsoleMock {
  private originalLog: typeof console.log;
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  
  public logs: string[] = [];
  public errors: string[] = [];
  public warnings: string[] = [];

  constructor() {
    this.originalLog = console.log;
    this.originalError = console.error;
    this.originalWarn = console.warn;
  }

  install(): void {
    console.log = (...args) => {
      this.logs.push(args.join(' '));
    };
    
    console.error = (...args) => {
      this.errors.push(args.join(' '));
    };
    
    console.warn = (...args) => {
      this.warnings.push(args.join(' '));
    };
  }

  restore(): void {
    console.log = this.originalLog;
    console.error = this.originalError;
    console.warn = this.originalWarn;
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
  }
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T
): T & { calls: Array<Parameters<T>>; callCount: number; reset: () => void } {
  const calls: Array<Parameters<T>> = [];
  
  const spy = ((...args: Parameters<T>) => {
    calls.push(args);
    if (implementation) {
      return implementation(...args);
    }
  }) as T & { calls: Array<Parameters<T>>; callCount: number; reset: () => void };
  
  Object.defineProperty(spy, 'calls', {
    get: () => calls
  });
  
  Object.defineProperty(spy, 'callCount', {
    get: () => calls.length
  });
  
  spy.reset = () => {
    calls.length = 0;
  };
  
  return spy;
}

/**
 * Assert that an array contains specific elements
 */
export function assertArrayContains<T>(array: T[], ...elements: T[]): void {
  for (const element of elements) {
    if (!array.includes(element)) {
      throw new Error(`Array does not contain expected element: ${element}`);
    }
  }
}

/**
 * Assert that an object has specific properties
 */
export function assertObjectHasProperties(
  obj: any,
  ...properties: string[]
): void {
  for (const prop of properties) {
    if (!(prop in obj)) {
      throw new Error(`Object missing expected property: ${prop}`);
    }
  }
}

/**
 * Assert that a function throws an error
 */
export async function assertThrows(
  fn: () => any | Promise<any>,
  expectedError?: string | RegExp | Error
): Promise<void> {
  let thrown = false;
  let error: any;
  
  try {
    await fn();
  } catch (e) {
    thrown = true;
    error = e;
  }
  
  if (!thrown) {
    throw new Error('Expected function to throw an error, but it did not');
  }
  
  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!error.message.includes(expectedError)) {
        throw new Error(`Expected error message to contain "${expectedError}", got: ${error.message}`);
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(error.message)) {
        throw new Error(`Expected error message to match ${expectedError}, got: ${error.message}`);
      }
    } else if (expectedError instanceof Error) {
      if (error.constructor !== expectedError.constructor) {
        throw new Error(`Expected error type ${expectedError.constructor.name}, got: ${error.constructor.name}`);
      }
    }
  }
}

/**
 * Test fixture for setting up and tearing down test environments
 */
export class TestFixture {
  private setupFunctions: Array<() => void | Promise<void>> = [];
  private teardownFunctions: Array<() => void | Promise<void>> = [];

  /**
   * Add a setup function to run before tests
   */
  setup(fn: () => void | Promise<void>): void {
    this.setupFunctions.push(fn);
  }

  /**
   * Add a teardown function to run after tests
   */
  teardown(fn: () => void | Promise<void>): void {
    this.teardownFunctions.push(fn);
  }

  /**
   * Run all setup functions
   */
  async runSetup(): Promise<void> {
    for (const fn of this.setupFunctions) {
      await fn();
    }
  }

  /**
   * Run all teardown functions
   */
  async runTeardown(): Promise<void> {
    for (const fn of this.teardownFunctions) {
      await fn();
    }
  }
}

/**
 * Random data generators for testing
 */
export const generators = {
  /**
   * Generate a random string of specified length
   */
  randomString(length = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Generate a random number within a range
   */
  randomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate a random boolean
   */
  randomBoolean(): boolean {
    return Math.random() < 0.5;
  },

  /**
   * Pick a random element from an array
   */
  randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Generate a random date within a range
   */
  randomDate(start = new Date(2020, 0, 1), end = new Date()): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return new Date(startTime + Math.random() * (endTime - startTime));
  }
};

/**
 * Export commonly used test constants
 */
export const TEST_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  RETRY_INTERVAL: 100,
  SAMPLE_ROLES: ['worker', 'coordinator', 'monitor', 'analyzer'],
  SAMPLE_PRIORITIES: ['low', 'medium', 'high', 'critical'] as const,
  SAMPLE_STATUSES: ['pending', 'in_progress', 'completed', 'failed'] as const
} as const;

/**
*  Type definitions for tman
*  https://github.com/thunks/tman
*  Definitions by: zensh <https://github.com/zensh>
*/

interface Callback {
  (error: Error, res?: any): void;
}

interface thunkFn {
  (callback: Callback): any;
}

interface thunk {
  (callback: Callback): thunk;
}

interface SuiteAction {
  (): void;
}

interface TestAction {
  (): void;
  (): PromiseLike<any>;
  (): thunk;
  (callback: Callback): void;
}

interface SuiteFn {
  (title: string, fn: SuiteAction): void;
  only(title: string, fn: SuiteAction): void;
  skip(title: string, fn: SuiteAction): void;
}

interface TestFn {
  (title: string, fn: TestAction): void;
  only(title: string, fn: TestAction): void;
  skip(title: string, fn: TestAction): void;
}

interface Tman {
  (suite: SuiteAction): void;
  (title: string, suite: SuiteAction): void;
  only(suite: SuiteAction): void;
  skip(suite: SuiteAction): void;
  only(title: string, fn: SuiteAction): void;
  skip(title: string, fn: SuiteAction): void;
  suite: SuiteFn;
  describe: SuiteFn;
  test: TestFn;
  it: TestFn;
  before(test: TestAction): void;
  after(test: TestAction): void;
  beforeEach(test: TestAction): void;
  afterEach(test: TestAction): void;
  grep(pattern: string): void;
  exclude(pattern: string): void;
  mocha(): void;
  tryRun(delay: number): void;
  run(callback: Callback): thunk;
}

interface SuiteResult {
  title: string;
  mode: string;
  depth: number;
  startTime: number;
  endTime: number;
  children: Array<SuiteResult | TestResult>;
}

interface TestResult {
  title: string;
  mode: string;
  depth: number;
  startTime: number;
  endTime: number;
  state: Error | boolean;
}

declare const tman: Tman;
export default tman;
export const NAME: string;
export const VERSION: string;
export const TEST: string;
export function createTman (): Tman;
export class Test {
  title: string;
  parent: Suite;
  constructor(title: string, parent: Suite, mode: 'only' | 'skip' | '');
  onStart(): void;
  onFinish(): void;
  fullTitle(): string;
  timeout(duration: number): void;
  toJSON(): TestResult;
  toThunk(): thunk;
}
export class Suite {
  title: string;
  parent: Suite;
  constructor(title: string, parent: Suite, fn: TestAction, mode: 'only' | 'skip' | '');
  onStart(): void;
  onFinish(): void;
  fullTitle(): string;
  timeout(duration: number): void;
  toJSON(): SuiteResult;
  toThunk(): thunk;
  log(...args: any[]): void;
}

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
  (title: string, fn: SuiteAction): Suite;
  only(title: string, fn: SuiteAction): Suite;
  skip(title: string, fn: SuiteAction): Suite;
}

interface TestFn {
  (title: string, fn: TestAction): Test;
  only(title: string, fn: TestAction): Test;
  skip(title: string, fn: TestAction): Test;
}

interface Tman {
  (suite: SuiteAction): Suite;
  (title: string, suite: SuiteAction): Suite;
  suite: SuiteFn;
  describe: SuiteFn;
  test: TestFn;
  it: TestFn;
  only(suite: SuiteAction): Suite;
  skip(suite: SuiteAction): Suite;
  only(title: string, fn: SuiteAction): Suite;
  skip(title: string, fn: SuiteAction): Suite;
  before(test: TestAction): void;
  after(test: TestAction): void;
  beforeEach(test: TestAction): void;
  afterEach(test: TestAction): void;
  grep(pattern: string): void;
  exclude(pattern: string): void;
  mocha(): void;
  reset(): void;
  setExit(boolean): void;
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

export default function (suite: SuiteAction): Suite;
export default function (title: string, suite: SuiteAction): Suite;

export const NAME: string;
export const VERSION: string;
export const TEST: string;
export let baseDir: string;

// method in Tman interface
export const suite: SuiteFn;
export const describe: SuiteFn;
export const test: TestFn;
export const it: TestFn;
export function only(suite: SuiteAction): Suite;
export function skip(suite: SuiteAction): Suite;
export function only(title: string, fn: SuiteAction): Suite;
export function skip(title: string, fn: SuiteAction): Suite;
export function before(test: TestAction): void;
export function after(test: TestAction): void;
export function beforeEach(test: TestAction): void;
export function afterEach(test: TestAction): void;
export function grep(pattern: string): void;
export function exclude(pattern: string): void;
export function mocha(): void;
export function reset(): void;
export function setExit(boolean): void;
export function tryRun(delay: number): void;
export function run(callback?: Callback): thunk;

// extra method
export function createTman (): Tman;
export function loadFiles(files: string | Array<string>): void;

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
  reset(): Suite;
  onStart(): void;
  onFinish(): void;
  fullTitle(): string;
  timeout(duration: number): void;
  toJSON(): SuiteResult;
  toThunk(): thunk;
  log(...args: any[]): void;
}

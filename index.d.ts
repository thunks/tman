// Type definitions for tman
// Project: https://github.com/thunks/tman
// Definitions by: zensh <https://github.com/zensh>

// Import: `import * as tman from 'tman'`
// Import: `import { suite, it, before, after, beforeEach, afterEach } from 'tman'`

interface Callback {
  (err?: Error): void;
}

interface ThunkLikeFunction {
  (fn: Callback): void;
}

interface ThunkFunction {
  (fn?: Callback): ThunkFunction;
}

interface AsyncFunction extends Function {
  (): PromiseLike;
}

interface AsyncFunctionConstructor {
  new (...args: string[]): AsyncFunction;
  (...args: string[]): AsyncFunction;
  prototype: AsyncFunction;
}

interface PromiseLike {
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: Error) => any): PromiseLike;
}

interface ToThunk {
  toThunk(): ThunkLikeFunction;
}

interface ToPromise {
  toPromise(): PromiseLike;
}

interface SuiteAction {
  (done?: SuitDone): void;
}

type SuitDone = (error?: any) => any;

type TestAction = (done: SuitDone) => any | PromiseLike;

interface SuiteFn {
  (title: string, fn: SuiteAction): tman.Suite;
  only(title: string, fn: SuiteAction): tman.Suite;
  skip(title: string, fn: SuiteAction): tman.Suite;
}

interface TestFn {
  (title: string, fn: TestAction): tman.Test;
  only(title: string, fn: TestAction): tman.Test;
  skip(title: string, fn: TestAction): tman.Test;
}

interface SuiteResult {
  ctx: tman.Suite;
  title: string;
  fullTitle: string;
  depth: number;
  startTime: number;
  endTime: number;
  state: Error | boolean;
  mode: 'skip' | 'only' | 'hasOnly';
}

interface RootSuiteResult extends SuiteResult {
  ctx: RootSuite;
  abort: boolean;
  passed: number;
  ignored: number;
  errors: Array<Error>;
}

interface TestResult {
  ctx: tman.Test;
  title: string;
  fullTitle: string;
  depth: number;
  startTime: number;
  endTime: number;
  state: Error | boolean;
  mode: 'skip' | 'only';
}

interface RootSuite extends tman.Suite {
  abort: boolean;
  passed: number;
  ignored: number;
  errors: Array<Error>;
  reporter: tman.Reporter;
}

interface Tman {
  (suite: SuiteAction): tman.Suite;
  (title: string, suite: SuiteAction): tman.Suite;
  rootSuite: RootSuite;
  suite: SuiteFn;
  describe: SuiteFn;
  test: TestFn;
  it: TestFn;
  only(suite: SuiteAction): tman.Suite;
  skip(suite: SuiteAction): tman.Suite;
  only(title: string, fn: SuiteAction): tman.Suite;
  skip(title: string, fn: SuiteAction): tman.Suite;
  before(test: TestAction): void;
  after(test: TestAction): void;
  beforeEach(test: TestAction): void;
  afterEach(test: TestAction): void;
  grep(pattern: string): void;
  exclude(pattern: string): void;
  mocha(): void;
  reset(): void;
  setExit(shouldExit: boolean): void;
  setReporter(reporter: tman.Reporter, options?: any): void;
  timeout(duration: number): void;
  tryRun(delay?: number): ThunkFunction;
  run(callback?: Callback): ThunkFunction;
}

declare function tman (suite: SuiteAction): tman.Suite;
declare function tman (title: string, suite: SuiteAction): tman.Suite;
declare namespace tman {
  export const NAME: string;
  export const VERSION: string;
  export const TEST: string;
  export var baseDir: string;
  // method in Tman interface
  export const suite: SuiteFn;
  export const describe: SuiteFn;
  export const test: TestFn;
  export const it: TestFn;
  export const rootSuite: RootSuite;

  export function tman (suite: SuiteAction): tman.Suite;
  export function tman (title: string, suite: SuiteAction): tman.Suite;
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
  export function setExit(shouldExit: boolean): void;
  export function timeout(duration: number): void;
  export function tryRun(delay?: number): ThunkFunction;
  export function run(callback?: Callback): ThunkFunction;

  // extra method
  export function createTman (): Tman;
  export function setBaseDir(path: string): void;
  export function globals(args: Array<string>): void;
  export function useColors(args: boolean): void;
  export function loadReporter(reporter: string): void;
  export function loadFiles(files: string | Array<string>, sort?: boolean): void;

  export class Test {
    title: string;
    parent: Suite;
    root: Suite;
    startTime: number;
    endTime: number;
    state: boolean | Error | void;
    depth: number;
    mode: 'skip' | 'only';
    constructor(title: string, parent: Suite, mode: 'only' | 'skip' | '');
    onStart(): void;
    onFinish(): void;
    fullTitle(): string;
    timeout(duration: number): void;
    toJSON(): TestResult;
    toThunk(): ThunkLikeFunction;
  }

  export class Suite {
    title: string;
    parent: Suite;
    root: Suite;
    startTime: number;
    endTime: number;
    state: boolean | Error | void;
    depth: number;
    children: Array<Suite | Test>;
    mode: 'skip' | 'only' | 'hasOnly';
    constructor(title: string, parent: Suite, fn: TestAction, mode: 'only' | 'skip' | '');
    reset(): Suite;
    onStart(): void;
    onFinish(): void;
    fullTitle(): string;
    timeout(duration: number): void;
    toJSON(): SuiteResult;
    toThunk(): ThunkLikeFunction;
    log(...args: any[]): void;
  }

  export class Reporter {
    ctx: Suite;
    constructor(ctx: Suite, options?: any);
    log(...args: any[]): void;
    onStart(): void;
    onSuiteStart(suiteResult: SuiteResult): void;
    onSuiteFinish(suiteResult: SuiteResult): void;
    onTestStart(suiteResult: TestResult): void;
    onTestFinish(suiteResult: TestResult): void;
    onFinish(rootSuiteResult: RootSuiteResult): void;
  }
}

export = tman;

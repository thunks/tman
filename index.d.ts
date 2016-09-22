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

interface GeneratorFunction extends Function {
  (): Generator;
}

interface GeneratorFunctionConstructor {
  new (...args: string[]): GeneratorFunction;
  (...args: string[]): GeneratorFunction;
  prototype: GeneratorFunction;
}

interface IteratorResult {
  done: boolean;
  value: any;
}

interface Generator {
  constructor: GeneratorFunctionConstructor;
  next(value?: any): IteratorResult;
  throw(err?: Error): IteratorResult;
  return(value?: any): IteratorResult;
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
  (): void;
}

interface OtherTestAction {
  (): ThunkLikeFunction | PromiseLike | GeneratorFunction | AsyncFunction | Generator | ToThunk | ToPromise | void;
}

type TestAction = ThunkLikeFunction | GeneratorFunction | AsyncFunction | OtherTestAction;

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

interface Tman {
  (suite: SuiteAction): tman.Suite;
  (title: string, suite: SuiteAction): tman.Suite;
  rootSuite: tman.Suite;
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
  setExit(boolean): void;
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
  // export class Suite extends Suite;
  // export class Test extends Test;
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
  export function setExit(boolean): void;
  export function timeout(duration: number): void;
  export function tryRun(delay?: number): ThunkFunction;
  export function run(callback?: Callback): ThunkFunction;

  // extra method
  export function createTman (): Tman;
  export function setBaseDir(path: string): void;
  export function globals(args: Array<string>): void;
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
}

export = tman;

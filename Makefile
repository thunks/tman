test:
	bin/tman 'test/*.js'
	bin/tman test/cli/gc -gc
	bin/tman test/cli/gc --expose-gc
	bin/tman test/cli/global --globals tman,suite,it,before,after
	bin/tman -g api -e ignore test/cli/grep-exclude
	bin/tman --mocha test/cli/mocha
	bin/tman --no-timeout test/cli/no-timeout
	!(bin/tman --reporter base test/cli/reporters.js)
	!(bin/tman -R dot test/cli/reporters.js)
	!(bin/tman --reporter spec test/cli/reporters.js)
	bin/tman -r test/cli/require-a test/cli/require-b
	bin/tman test/cli/reset
	!(bin/tman -t 650 test/cli/timeout)
	bin/tman test/cli/test-in-src
	node test/cli/test-in-src --test
	TEST=* node test/cli/test-in-src
	bin/tman -r coffee-script/register test/coffee
	bin/tman -r ts-node/register test/typings.test.ts
	open test/browser/index-error.html
	sleep 2s
	open test/browser/index.html
	sleep 2s
	open test/browser/index-async.html -a '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

.PHONY: test

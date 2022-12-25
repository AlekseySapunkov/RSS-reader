install:
	npm ci
	chmod +x bin/*.js

publish:
	npm publish --dry-run

make lint:
	npx eslint .

link:
	npm link
	
run:
	bin/newsAggregator.js

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY: test
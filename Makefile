install:
	npm ci

publish:
	npm publish --dry-run

make lint:
	npx eslint .
make lint-fix:
	npx eslint . --fix
webpack:
	npx webpack
webpack-watch:
	npx webpack	--watch
webpack-server:	
	npx webpack-dev-server --open
link:
	npm link
	
build:
	rm -rf dist
	NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npx webpack
develop:
	npx webpack serve
test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY: test
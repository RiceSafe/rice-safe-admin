.PHONY: dev build preview test test-watch clean

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm run test -- --run

test-watch:
	npm run test

clean:
	rm -rf dist node_modules

test: ## Runs all tests
	@echo "Running tests"
	npm run test

build: ## Builds the extension
	# Get rid of the old build
	rm -rf ./dist
	
	# tsc compiles the typescript files
	@echo "Building library"
	npm run build
	
	# Copy the package.json to the dist folder
	cp package.json dist/

	# Copy the styles for content script
	mkdir -p dist/content-scripts/assets/styles
	cp src/content-scripts/assets/styles/* dist/content-scripts/assets/styles


# release: ## Builds the extension for release
# 	rm -rf ./dist
# 	@echo "Building release library"
# 	npm run build
# 	cp package.json dist/

.DEFAULT_GOAL := help
help: ## Display this help message
	@echo "Usage: make [TARGET] ..."
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

PHONY: help
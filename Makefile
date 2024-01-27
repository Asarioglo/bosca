install_all: ## Installs all dependencies
	@echo "Installing all dependencies"
	npm install
	cd ./src/popup-react && npm install

build_dev: ## Builds everything needed for the browser
	@echo "Building for development"
	npm run build:dev
	cd ./src/popup-react && npm run build

test: ## Runs all tests
	@echo "Running tests"
	npm run test
	cd ./src/popup-react && npm run test

.DEFAULT_GOAL := help
help: ## Display this help message
	@echo "Usage: make [TARGET] ..."
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

PHONY: help
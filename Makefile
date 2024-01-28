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
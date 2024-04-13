.PHONY: build clean run version

BINARY_NAME=genmoji
VERSION=0.4.1
BUILD_DIR=bin

TARGETS=darwin-arm64 darwin-amd64 linux-arm64 linux-amd64
LDFLAGS="-w -s -X main.AppVersion=$(VERSION) -X main.AppName=$(BINARY_NAME)"

build:
	GOOS=darwin GOARCH=arm64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 -ldflags $(LDFLAGS)
	GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 -ldflags $(LDFLAGS)
	GOOS=linux GOARCH=arm64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 -ldflags $(LDFLAGS)
	GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 -ldflags $(LDFLAGS)

clean:
	rm -rf $(BUILD_DIR)

run:
	@go build -o $(BUILD_DIR)/genmoji -ldflags $(LDFLAGS)
	@./bin/genmoji

version:
	@echo $(VERSION)

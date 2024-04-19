package config

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
)

// A configuration object that can be persisted to disk
type Config[T any] struct {
	Name string
	Data T
}

// Prepare the directory and file for persisting the configuration.
// This will create the directory and file if they do not exist.
func prepare[T any](path string, data T) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		// Create the path leading up to the file
		err := os.MkdirAll(filepath.Dir(path), os.ModePerm)
		if err != nil {
			return err
		}

		// Create the file
		file, err := os.Create(path)
		if err != nil {
			return err
		}
		defer file.Close()

		// Write the initial data to the file
		err = json.NewEncoder(file).Encode(&data)
		if err != nil {
			return err
		}
	}

	return nil
}

// Create a new configuration based on the provided name and initial data
func New[T any](name string, initial T) *Config[T] {
	dirname, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}

	// Prepare the directory and file for persisting the configuration
	path := filepath.Join(dirname, ".config", name, "config.json")
	err = prepare(path, initial)
	if err != nil {
		log.Fatal(err)
	}

	// Load the configuration
	file, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	// Read the configuration and persist in memory
	var data T
	err = json.NewDecoder(file).Decode(&data)
	if err != nil {
		log.Fatal(err)
	}

	return &Config[T]{
		Name: name,
		Data: data,
	}
}

// Persist the configuration to disk
func (config *Config[T]) Save() error {
	dirname, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	path := filepath.Join(dirname, ".config", config.Name, "config.json")

	// Persist the configuration
	file, err := os.OpenFile(path, os.O_WRONLY, os.ModePerm)
	if err != nil {
		return err
	}
	defer file.Close()

	// Clear the file before writing to it
	file.Truncate(0)

	// Write the configuration to the file
	err = json.NewEncoder(file).Encode(&config.Data)
	if err != nil {
		return err
	}

	return nil
}

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Gitmoji struct {
	Emoji       string `json:"emoji"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Name        string `json:"name"`
}

type Response struct {
	Gitmojis []Gitmoji `json:"gitmojis"`
}

func isCached(path string) bool {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}

	return true
}

func fetchFromCache(path string) ([]Gitmoji, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var response Response
	err = json.NewDecoder(file).Decode(&response)
	if err != nil {
		return nil, err
	}

	return response.Gitmojis, nil
}

func writeToCache(path string, response Response) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	err = json.NewEncoder(file).Encode(&response)
	if err != nil {
		return err
	}

	return nil
}

func fetchGitmojis() ([]Gitmoji, error) {
	dirname, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}

	var path string = dirname + "/.genmoji/gitmojis.json"
	if isCached(path) {
		return fetchFromCache(path)
	}

	res, err := http.Get("https://gitmoji.dev/api/gitmojis")
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var response Response
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return nil, err
	}

	if err := writeToCache(path, response); err != nil {
		return nil, err
	}

	return response.Gitmojis, nil
}

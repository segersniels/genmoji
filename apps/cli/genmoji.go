package main

import (
	"log"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/huh/spinner"
	"github.com/charmbracelet/lipgloss"
)

type Genmoji struct {
	client OpenAI
}

func NewGenmoji() *Genmoji {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		log.Fatal("OPENAI_API is not set")
	}

	return &Genmoji{
		client: *NewOpenAI(apiKey),
	}
}

func (g *Genmoji) Generate() (string, error) {
	diff, err := getStagedChanges()
	if err != nil {
		return "", err
	}

	var response string
	if err := spinner.New().TitleStyle(lipgloss.NewStyle()).Title("Generating your commit message...").Action(func() {
		response, err = g.client.GetChatCompletion(diff)
		if err != nil {
			log.Fatal(err)
		}
	}).Run(); err != nil {
		return "", err
	}

	return response, nil
}

func (g *Genmoji) Commit() error {
	diff, err := getStagedChanges()
	if err != nil {
		return err
	}

	var response string
	for {
		if err := spinner.New().TitleStyle(lipgloss.NewStyle()).Title("Generating your commit message...").Action(func() {
			response, err = g.client.GetChatCompletion(diff)
			if err != nil {
				log.Fatal(err)
			}
		}).Run(); err != nil {
			return err
		}

		var confirmation bool
		err := huh.NewConfirm().Title(response).Description("Do you want to commit this message?").Value(&confirmation).Run()
		if err != nil {
			return err
		}

		if confirmation {
			break
		}
	}

	if err := commit(response); err != nil {
		return err
	}

	return nil
}

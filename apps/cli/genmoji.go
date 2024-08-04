package main

import (
	"log"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/huh/spinner"
	"github.com/charmbracelet/lipgloss"
)

type Genmoji struct {
	client MessageClient
}

func NewGenmoji() *Genmoji {
	var (
		client MessageClient
		apiKey string
	)

	// Depending on the user selected model, we need to set the corresponding API key
	switch CONFIG.Data.Model {
	case Claude3Dot5Sonnet:
		apiKey = os.Getenv("ANTHROPIC_API_KEY")
		if apiKey == "" {
			log.Fatal("ANTHROPIC_API_KEY is not set")
		}

		client = NewAnthropic(apiKey)
	default:
		apiKey = os.Getenv("OPENAI_API_KEY")
		if apiKey == "" {
			log.Fatal("OPENAI_API_KEY is not set")
		}

		client = NewOpenAI(apiKey)
	}

	return &Genmoji{
		client,
	}
}

func (g *Genmoji) Generate() (string, error) {
	diff, err := getStagedChanges()
	if err != nil {
		return "", err
	}

	var response string
	err = spinner.New().TitleStyle(lipgloss.NewStyle()).Title("Generating your commit message...").Action(func() {
		response, err = g.client.CreateMessage(diff)
	}).Run()

	if err != nil {
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
			response, err = g.client.CreateMessage(diff)
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

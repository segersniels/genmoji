package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/segersniels/config"
	"github.com/urfave/cli/v2"
)

const (
	GPT4o             = "gpt-4o"
	GPT4oMini         = "gpt-4o-mini"
	GPT4Turbo         = "gpt-4-turbo"
	GPT3Dot5Turbo     = "gpt-3.5-turbo"
	Claude3Dot5Sonnet = "claude-3-5-sonnet-20240620"
)

var AppVersion string
var AppName string

type ConfigData struct {
	Model string `json:"model"`
}

var CONFIG = config.NewConfig("genmoji", ConfigData{
	Model: GPT4oMini,
})

func main() {
	genmoji := NewGenmoji()

	app := &cli.App{
		Name:    AppName,
		Usage:   "Generate commit messages for your staged changes",
		Version: AppVersion,
		Commands: []*cli.Command{
			{
				Name:  "generate",
				Usage: "Generate a commit message",
				Action: func(ctx *cli.Context) error {
					response, err := genmoji.Generate()
					if err != nil {
						return err
					}

					fmt.Println(response)
					return nil
				},
			},
			{
				Name:  "commit",
				Usage: "Generate a commit message and commit it",
				Action: func(ctx *cli.Context) error {
					return genmoji.Commit()
				},
			},
			{
				Name:  "config",
				Usage: "Configure the app",
				Subcommands: []*cli.Command{
					{
						Name:  "init",
						Usage: "Initialize the config",
						Action: func(ctx *cli.Context) error {
							models := huh.NewOptions(GPT4o, GPT4oMini, GPT4Turbo, GPT3Dot5Turbo, Claude3Dot5Sonnet)
							form := huh.NewForm(
								huh.NewGroup(
									huh.NewSelect[string]().Title("Model").Description("Configure the default model").Options(models...).Value(&CONFIG.Data.Model),
								),
							)

							err := form.Run()
							if err != nil {
								return err
							}

							return CONFIG.Save()
						},
					},
					{
						Name:  "ls",
						Usage: "List the current configuration",
						Action: func(ctx *cli.Context) error {
							data, err := json.MarshalIndent(CONFIG.Data, "", "  ")
							if err != nil {
								return err
							}

							fmt.Println(string(data))
							return nil
						},
					},
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

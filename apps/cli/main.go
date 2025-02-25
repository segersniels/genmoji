package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/segersniels/config"
	updater "github.com/segersniels/updater"
	"github.com/urfave/cli/v2"
)

var (
	AppVersion string
	AppName    string
)

type Model string

const (
	GPT4o             Model = "gpt-4o"
	GPT4oMini         Model = "gpt-4o-mini"
	Claude3Dot7Sonnet Model = "claude-3-7-sonnet-latest"
	Claude3Dot5Sonnet Model = "claude-3-5-sonnet-latest"
	Claude3Dot5Haiku  Model = "claude-3-5-haiku-latest"
)

type ConfigData struct {
	Model Model `json:"model"`
}

var CONFIG = config.NewConfig("genmoji", ConfigData{
	Model: GPT4oMini,
})

func main() {
	upd := updater.NewUpdater(AppName, AppVersion, "segersniels")
	version := upd.IsNewVersionAvailable()
	if version != nil {
		fmt.Printf("A new version of %s is available (%s).\n\n", AppName, version.String())
	}

	app := &cli.App{
		Name:    AppName,
		Usage:   "Generate commit messages for your staged changes",
		Version: AppVersion,
		Commands: []*cli.Command{
			{
				Name:  "generate",
				Usage: "Generate a commit message",
				Action: func(ctx *cli.Context) error {
					genmoji := NewGenmoji()
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
					genmoji := NewGenmoji()
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
							models := huh.NewOptions(GPT4o, GPT4oMini, Claude3Dot7Sonnet, Claude3Dot5Sonnet, Claude3Dot5Haiku)
							form := huh.NewForm(
								huh.NewGroup(
									huh.NewSelect[Model]().Title("Model").Description("Configure the default model").Options(models...).Value(&CONFIG.Data.Model),
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

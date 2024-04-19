package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"segersniels/genmoji/config"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/huh/spinner"
	"github.com/charmbracelet/lipgloss"
	"github.com/urfave/cli/v2"
)

var AppVersion string
var AppName string

func generateActionFunc(ctx *cli.Context) error {
	diff, err := getStagedChanges()
	if err != nil {
		fmt.Println(err)
		return nil
	}

	model := ctx.String("model")
	if model == "" {
		model = CONFIG.Data.Model
	} else if !IsSupported(model) {
		return fmt.Errorf("unsupported model: %s", model)
	}

	var response string
	if err := spinner.New().TitleStyle(lipgloss.NewStyle()).Title("Generating your commit message...").Action(func() {
		response, err = getCompletion(diff, model)
		if err != nil {
			log.Fatal(err)
		}
	}).Run(); err != nil {
		return err
	}

	fmt.Println(response)
	return nil
}

func commitActionFunc(ctx *cli.Context) error {
	diff, err := getStagedChanges()
	if err != nil {
		fmt.Println(err)
		return nil
	}

	var response string
	for {
		model := ctx.String("model")
		if model == "" {
			model = CONFIG.Data.Model
		} else if !IsSupported(model) {
			return fmt.Errorf("unsupported model: %s", model)
		}

		if err := spinner.New().TitleStyle(lipgloss.NewStyle()).Title("Generating your commit message...").Action(func() {
			response, err = getCompletion(diff, model)
			if err != nil {
				log.Fatal(err)
			}
		}).Run(); err != nil {
			return err
		}

		fmt.Println(response)

		var confirmation bool
		err := huh.NewConfirm().Title("Do you want to commit this message?").Value(&confirmation).Run()
		if err != nil {
			return nil
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

type ConfigData struct {
	Model string `json:"model"`
}

var CONFIG = config.New("genmoji", ConfigData{
	Model: Default.Value(),
})

func configActionFunc(ctx *cli.Context) error {
	form := huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().Title("Model").Description("Configure the default model").Options(huh.NewOption(Default.Value(), Default.Value()), huh.NewOption(Fast.Value(), Fast.Value())).Value(&CONFIG.Data.Model),
		),
	)

	err := form.Run()
	if err != nil {
		return err
	}

	return CONFIG.Save()
}

func main() {
	app := &cli.App{
		Name:    AppName,
		Usage:   "Generate commit messages for your staged changes",
		Version: AppVersion,
		Commands: []*cli.Command{
			{
				Name:  "generate",
				Usage: "Generate a commit message",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:        "model",
						Value:       CONFIG.Data.Model,
						DefaultText: CONFIG.Data.Model,
						Usage:       "The model to use for generating the commit message",
					},
				},
				Action: generateActionFunc,
			},
			{
				Name:  "commit",
				Usage: "Generate a commit message and commit it",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:        "model",
						Value:       CONFIG.Data.Model,
						DefaultText: CONFIG.Data.Model,
						Usage:       "The model to use for generating the commit message",
					},
				},
				Action: commitActionFunc,
			},
			{
				Name:  "config",
				Usage: "Configure the app",
				Subcommands: []*cli.Command{
					{
						Name:   "init",
						Usage:  "Initialize the config",
						Action: configActionFunc,
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

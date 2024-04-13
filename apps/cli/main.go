package main

import (
	"fmt"
	"log"
	"os"

	"github.com/manifoldco/promptui"
	"github.com/urfave/cli/v2"
)

func generateActionFunc(ctx *cli.Context) error {
	diff, err := getStagedChanges()
	if err != nil {
		return err
	}

	response, err := getCompletion(diff, ctx.String("model"))
	if err != nil {
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
		response, err = getCompletion(diff, ctx.String("model"))
		if err != nil {
			return err
		}

		fmt.Println(response)
		prompt := promptui.Prompt{
			Label:     "Do you want to commit this message?",
			IsConfirm: true,
		}

		result, err := prompt.Run()
		if err != nil {
			return err
		}

		if result == "y" {
			break
		}
	}

	if err := commit(response); err != nil {
		return err
	}

	return nil
}

var AppVersion string
var AppName string

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
						Name:  "model",
						Value: "gpt-4-turbo-preview",
						Usage: "The model to use for generating the commit message",
					},
				},
				Action: generateActionFunc,
			},
			{
				Name:  "commit",
				Usage: "Generate a commit message and commit it",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "model",
						Value: "gpt-4-turbo-preview",
						Usage: "The model to use for generating the commit message",
					},
				},
				Action: commitActionFunc,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

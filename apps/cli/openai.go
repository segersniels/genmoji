package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const SYSTEM_MESSAGE string = `
You are a helpful coding assistant responsible for generating fitting commit messages.
You will be provided a git diff or code snippet and you are expected to provide a suitable commit message.
If a user provides anything else than you are expecting respond with a fitting message and ask for the correct input (don't include emojis in this message).

When reviewing the diff or code, focus on identifying the main purpose of the changes.
Describe the change to the best of your capabilities in a maximum of one short sentence on one line.

When reviewing a diff, pay attention to the changed filenames and extract the context of the changes.
This will help you create a more relevant and informative commit message.
Here are some examples of how you can interpret some changed filenames:
 - Files or filepaths that reference testing are usually related to tests.
 - Markdown files are usually related to documentation.
 - Config file adjustments are usually related to configuration changes.

Try to match the generated message to a fitting emoji using its description from the provided list above.
So go look in the descriptions and find the one that best matches the description.

Always start your commit message with a gitmoji followed by the message starting with a capital letter.
Never mention filenames or function names in the message.

Below you can find a list of available gitmojis and their descriptions. Try to look for a fitting emoji and message.
Use the code representation of the emoji in the commit message.

A gitmoji commit message should look like the following: :code: Your message here
`

type Model int

const (
	Fast Model = iota
	Default
)

func (m Model) Value() string {
	switch m {
	case Fast:
		return "gpt-3.5-turbo"
	case Default:
		return "gpt-4-turbo-preview"
	default:
		return "unknown"
	}
}

func IsSupported(model string) bool {
	return model == Fast.Value() || model == Default.Value()
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Choice struct {
	Message Message `json:"message"`
}

type ChatCompletionResponse struct {
	Choices []Choice `json:"choices"`
}

func getCompletion(prompt string, model string) (string, error) {
	if !IsSupported(model) {
		return "", fmt.Errorf("unsupported model: %s", model)
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY is not set")
	}

	gitmojis, err := fetchGitmojis()
	if err != nil {
		return "", err
	}

	list, err := json.Marshal(gitmojis)
	if err != nil {
		return "", err
	}

	var systemMessage string = SYSTEM_MESSAGE + string(list)
	body := ChatCompletionRequest{
		Model: model,
		Messages: []Message{
			{Role: "system", Content: systemMessage},
			{Role: "user", Content: prompt},
		},
	}

	data, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(data))
	if err != nil {
		return "", err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	var response ChatCompletionResponse
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return "", err
	}

	return response.Choices[0].Message.Content, nil
}

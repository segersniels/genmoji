package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	openai "github.com/sashabaranov/go-openai"
)

const (
	MessageRoleSystem    = "system"
	MessageRoleUser      = "user"
	MessageRoleAssistant = "assistant"
)

type MessageClient interface {
	CreateMessage(diff string) (string, error)
}

// Ensure OpenAI satisfies the MessageClient interface
var _ MessageClient = (*OpenAI)(nil)

type OpenAI struct {
	ApiKey string
}

func NewOpenAI(apiKey string) *OpenAI {
	return &OpenAI{
		ApiKey: apiKey,
	}
}

func (o *OpenAI) CreateMessage(diff string) (string, error) {
	gitmojis, err := fetchGitmojis()
	if err != nil {
		return "", err
	}

	list, err := json.Marshal(gitmojis)
	if err != nil {
		return "", err
	}

	client := openai.NewClient(o.ApiKey)
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: CONFIG.Data.Model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    MessageRoleSystem,
					Content: SYSTEM_MESSAGE + string(list),
				},
				{
					Role:    MessageRoleUser,
					Content: prepareDiff(diff),
				},
			},
		},
	)

	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}

type ClaudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ClaudeMessagesRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system"`
	Messages  []ClaudeMessage `json:"messages"`
}

type ClaudeMessagesResponseContent struct {
	Text string `json:"text"`
	Type string `json:"type"`
}

type ClaudeMessagesResponseUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type ClaudeMessagesResponse struct {
	ID      string                          `json:"id"`
	Role    string                          `json:"role"`
	Model   string                          `json:"model"`
	Content []ClaudeMessagesResponseContent `json:"content"`
	Usage   ClaudeMessagesResponseUsage     `json:"usage"`
}

// Ensure Anthropic satisfies the MessageClient interface
var _ MessageClient = (*Anthropic)(nil)

type Anthropic struct {
	ApiKey string
}

func NewAnthropic(apiKey string) *Anthropic {
	return &Anthropic{
		ApiKey: apiKey,
	}
}

func (a *Anthropic) CreateMessage(diff string) (string, error) {
	gitmojis, err := fetchGitmojis()
	if err != nil {
		return "", err
	}

	list, err := json.Marshal(gitmojis)
	if err != nil {
		return "", err
	}

	body, err := json.Marshal(map[string]interface{}{
		"model":      Claude3Dot5Sonnet,
		"max_tokens": 4096,
		"system":     SYSTEM_MESSAGE + string(list),
		"messages": []ClaudeMessage{
			{
				Role:    MessageRoleUser,
				Content: prepareDiff(diff),
			},
		},
	})

	if err != nil {
		return "", fmt.Errorf("error marshaling JSON payload: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.anthropic.com/v1/messages", bytes.NewBuffer(body))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", a.ApiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var data ClaudeMessagesResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	return data.Content[0].Text, nil
}

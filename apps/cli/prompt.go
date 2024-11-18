package main

import (
	"errors"
	"fmt"
	"os/exec"
	"strings"
	"sync"
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

A gitmoji commit message should look like the following: :code: Your message here

Below you can find a list of available gitmojis and their descriptions. Try to look for a fitting emoji and message.
Use the code representation of the emoji in the commit message.
`

var FILES_TO_IGNORE = []string{
	"package-lock.json",
	"yarn.lock",
	"npm-debug.log",
	"yarn-debug.log",
	"yarn-error.log",
	".pnpm-debug.log",
	"Cargo.lock",
	"Gemfile.lock",
	"mix.lock",
	"Pipfile.lock",
	"composer.lock",
	"go.sum",
}

func splitDiffIntoChunks(diff string) []string {
	split := strings.Split(diff, "diff --git")[1:]
	for i, chunk := range split {
		split[i] = strings.TrimSpace(chunk)
	}

	return split
}

func removeLockFiles(chunks []string) []string {
	var wg sync.WaitGroup

	filtered := make(chan string)

	for _, chunk := range chunks {
		wg.Add(1)

		go func(chunk string) {
			defer wg.Done()
			shouldIgnore := false
			header := strings.Split(chunk, "\n")[0]

			// Check if the first line contains any of the files to ignore
			for _, file := range FILES_TO_IGNORE {
				if strings.Contains(header, file) {
					shouldIgnore = true
				}
			}

			if !shouldIgnore {
				filtered <- chunk
			}
		}(chunk)
	}

	go func() {
		wg.Wait()
		close(filtered)
	}()

	var result []string
	for chunk := range filtered {
		result = append(result, chunk)
	}

	return result
}

// Split the diff in chunks and remove any lock files to save on tokens
func prepareDiff(diff string) string {
	chunks := splitDiffIntoChunks(diff)

	return strings.Join(removeLockFiles(chunks), "\n")
}

func getStagedChanges() (string, error) {
	cmd := exec.Command("git", "diff", "--cached")
	stdout, err := cmd.Output()

	if err != nil {
		return "", err
	}

	if len(stdout) == 0 {
		return "", errors.New("no staged changes found")
	}

	return string(stdout), nil
}

func commit(message string) error {
	cmd := exec.Command("git", "commit", "-m", message)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error committing: %s", string(output))
	}

	return nil
}

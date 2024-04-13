package main

import (
	"errors"
	"os/exec"
)

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
	return cmd.Run()
}

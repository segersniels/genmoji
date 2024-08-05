# genmoji

[Genmoji](https://genmoji.dev) is a tool and [website](https://genmoji.dev) that uses OpenAI's GPT or Anthropic's Claude API to generate commit messages from code snippets or `git diff`. With [Genmoji](https://genmoji.dev), developers can easily create informative and concise commit messages, using the [gitmoji](https://gitmoji.dev) standard, without spending time and effort writing them themselves.

![img](./apps/web/public/demo.gif)

## Install

Bring your own API key. You will need either an OpenAI or Anthropic API key exported as the environment variables `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.

```bash
# Install in the current directory
curl -sSL https://raw.githubusercontent.com/segersniels/genmoji/master/scripts/install.sh | bash
# Install in /usr/local/bin
curl -sSL https://raw.githubusercontent.com/segersniels/genmoji/master/scripts/install.sh | sudo bash -s /usr/local/bin
```

### Manual

1. Download the latest binary from the [releases](https://github.com/segersniels/genmoji/releases/latest) page for your system
2. Rename the binary to `genmoji`
3. Copy the binary to a location in your `$PATH`

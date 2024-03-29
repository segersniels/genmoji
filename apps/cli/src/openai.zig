const std = @import("std");
const emoji = @import("emoji.zig");

const Message = struct {
    role: []const u8,
    content: []const u8,
};

const CompletionRequest = struct {
    messages: []Message,
    model: []const u8,
};

const Choice = struct {
    message: Message,
};

const CompletionResponse = struct {
    choices: []Choice,
};

const SYSTEM_MESSAGE =
    \\ You are a helpful coding assistant responsible for generating fitting commit messages.
    \\ You will be provided a git diff or code snippet and you are expected to provide a suitable commit message.
    \\ If a user provides anything else than you are expecting respond with a fitting message and ask for the correct input (don't include emojis in this message).
    \\
    \\ When reviewing the diff or code, focus on identifying the main purpose of the changes.
    \\ Describe the change to the best of your capabilities in a maximum of one short sentence on one line.
    \\
    \\ When reviewing a diff, pay attention to the changed filenames and extract the context of the changes.
    \\ This will help you create a more relevant and informative commit message.
    \\ Here are some examples of how you can interpret some changed filenames:
    \\  - Files or filepaths that reference testing are usually related to tests.
    \\  - Markdown files are usually related to documentation.
    \\  - Config file adjustments are usually related to configuration changes.
    \\
    \\ Try to match the generated message to a fitting emoji using its description from the provided list above.
    \\ So go look in the descriptions and find the one that best matches the description.
    \\
    \\ Always start your commit message with a gitmoji followed by the message starting with a capital letter.
    \\ Never mention filenames or function names in the message.
    \\
    \\ Below you can find a list of available gitmojis and their descriptions. Try to look for a fitting emoji and message.
    \\ Use the code representation of the emoji in the commit message.
    \\
    \\ A gitmoji commit message should look like the following: :code: Your message here
;

pub fn getCompletion(allocator: std.mem.Allocator, prompt: []const u8) !CompletionResponse {
    var env = try std.process.getEnvMap(allocator);
    defer env.deinit();

    const api_key = env.get("OPENAI_API_KEY") orelse {
        std.debug.print("Missing OPENAI_API_KEY environment variable\n", .{});
        std.process.exit(1);
    };

    var client: std.http.Client = .{ .allocator = allocator };
    defer client.deinit();

    const bearer_token = try std.fmt.allocPrint(allocator, "Bearer {s}", .{api_key});
    const headers = std.http.Client.Request.Headers{ .authorization = std.http.Client.Request.Headers.Value{ .override = bearer_token }, .content_type = std.http.Client.Request.Headers.Value{ .override = "application/json" } };

    const gitmojis = try emoji.fetchGitmojis(allocator);
    const system_message = try std.fmt.allocPrint(allocator, "{s}\n\nHere's an overview of available gitmojis and when they should be used:\n{s}", .{ SYSTEM_MESSAGE, std.json.fmt(gitmojis.gitmojis, .{}) });

    var messages = std.ArrayList(Message).init(allocator);
    try messages.append(.{ .role = "system", .content = system_message });
    try messages.append(.{ .role = "user", .content = prompt });

    const request = CompletionRequest{
        .messages = messages.items,
        .model = "gpt-4-turbo-preview",
    };
    defer messages.deinit();

    const payload = try std.json.stringifyAlloc(allocator, request, .{});
    var body = std.ArrayList(u8).init(allocator);
    _ = try client.fetch(.{ .location = .{ .url = "https://api.openai.com/v1/chat/completions" }, .method = .POST, .headers = headers, .response_storage = .{ .dynamic = &body }, .payload = payload });

    const data = try std.json.parseFromSlice(CompletionResponse, allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    return data.value;
}

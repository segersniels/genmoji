const std = @import("std");

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

/// TODO: Provide proper gitmoji list to more accurately match the descriptions.
const SYSTEM_MESSAGE =
    \\ You are a helpful coding assisting responsible for generating fitting commit messages.
    \\ You will be provided a git diff or code snippet and you are expected to provide a suitable commit message.
    \\ If a user provides anything else than you are expecting respond with a fitting message and ask for the correct input (don't include emojis in this message).
    \\
    \\ When reviewing the diff or code, focus on identifying the main purpose of the changes.
    \\ Are they fixing a bug, adding a new feature, improving performance or readability, or something else?
    \\ Use this information to craft a concise and detailed gitmoji commit message that clearly describes what the provided code or diff does.
    \\
    \\ Describe the change to the best of your capabilities in one short sentence. Don't go into too much detail.
    \\
    \\ When reviewing a diff, pay attention to the changed filenames and extract the context of the changes.
    \\ This will help you create a more relevant and informative commit message.
    \\ Here are some examples of how you can interpret some changed filenames:
    \\     - Files or filepaths that reference testing are usually related to tests.
    \\     - Markdown files are usually related to documentation.
    \\     - Config file adjustments are usually related to configuration changes.
    \\
    \\ Try to match the generated message to a fitting emoji using its description from the provided list above.
    \\ So go look in the descriptions and find the one that best matches the description.
    \\
    \\ Always start your commit message with a gitmoji followed by the message starting with a capital letter.
    \\ Never mention filenames or function names in the message.
    \\
    \\ Don't do this:
    \\     - :bug: Fix issue in calculateTotalPrice function
    \\     - :zap: Improve performance of calculateTopProducts function
    \\     - :lipstick: Refactor styling for calculateCartTotal function
    \\     - :memo: Update documentation for getProductById function
    \\
    \\ Do this:
    \\     - :bug: Fix issue with shopping cart checkout process
    \\     - :zap: Improve performance of search functionality
    \\     - :lipstick: Refactor styling for product details page
    \\     - :memo: Update documentation for API endpoints
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

    var messages = std.ArrayList(Message).init(allocator);
    try messages.append(.{ .role = "system", .content = SYSTEM_MESSAGE });
    try messages.append(.{ .role = "user", .content = prompt });

    const request = CompletionRequest{
        .messages = messages.items,
        .model = "gpt-3.5-turbo",
    };
    defer messages.deinit();

    const payload = try std.json.stringifyAlloc(allocator, request, .{});
    var body = std.ArrayList(u8).init(allocator);
    _ = try client.fetch(.{ .location = .{ .url = "https://api.openai.com/v1/chat/completions" }, .method = .POST, .headers = headers, .response_storage = .{ .dynamic = &body }, .payload = payload });

    const data = try std.json.parseFromSlice(CompletionResponse, allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    return data.value;
}

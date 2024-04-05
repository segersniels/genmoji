const std = @import("std");
const package = @import("package");
const openai = @import("openai.zig");
const git = @import("git.zig");
const cli = @import("zig-cli");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();

var config = struct {
    model: []const u8 = "gpt-4-turbo-preview",
}{};

var model = cli.Option{
    .long_name = "model",
    .help = "OpenAI model to use (default: gpt-4-turbo-preview)",
    .value_ref = cli.mkRef(&config.model),
};

fn generate_handler() !void {
    const diff = try git.getStagedChanges(allocator);
    if (diff.len == 0) {
        try std.io.getStdOut().writer().print("No changes to commit\n", .{});
        return;
    }

    const response = try openai.getCompletion(allocator, diff, config.model);

    try std.io.getStdOut().writer().print("{s}\n", .{response.choices[0].message.content});
}

fn commit_handler() !void {
    const diff = try git.getStagedChanges(allocator);
    if (diff.len == 0) {
        try std.io.getStdOut().writer().print("No changes to commit\n", .{});
        return;
    }

    const response = try openai.getCompletion(allocator, diff, config.model);
    const message = response.choices[0].message.content;

    try git.commit(allocator, message);
}

var generate = cli.Command{
    .name = "generate",
    .description = cli.Description{ .one_line = "Generate a commit message based on the current staged changes" },
    .target = cli.CommandTarget{ .action = cli.CommandAction{ .exec = generate_handler } },
};

var commit = cli.Command{
    .name = "commit",
    .description = cli.Description{ .one_line = "Generate a commit message & commit for your staged changes" },
    .target = cli.CommandTarget{ .action = cli.CommandAction{ .exec = commit_handler } },
};

var app = &cli.App{
    .command = cli.Command{
        .name = "genmoji",
        .options = &.{&model},
        .target = cli.CommandTarget{ .subcommands = &.{ &generate, &commit } },
    },
    .version = package.version,
};

pub fn main() !void {
    defer arena.deinit();

    return cli.run(app, allocator);
}

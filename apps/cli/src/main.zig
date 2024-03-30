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
    .help = "OpenAI model to use",
    .value_ref = cli.mkRef(&config.model),
};

fn generate() !void {
    const diff = try git.getStagedChanges(allocator);
    if (diff.len == 0) {
        try std.io.getStdOut().writer().print("No changes to commit\n", .{});
        return;
    }

    const response = try openai.getCompletion(allocator, diff, config.model);

    try std.io.getStdOut().writer().print("{s}\n", .{response.choices[0].message.content});
}

var app = &cli.App{
    .command = cli.Command{
        .name = "genmoji",
        .options = &.{&model},
        .target = cli.CommandTarget{
            .action = cli.CommandAction{ .exec = generate },
        },
    },
    .version = package.version,
};

pub fn main() !void {
    defer arena.deinit();

    return cli.run(app, allocator);
}

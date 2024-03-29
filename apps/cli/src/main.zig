const std = @import("std");
const package = @import("package");
const openai = @import("openai.zig");
const git = @import("git.zig");

fn printVersion() !void {
    try std.io.getStdOut().writer().print("genmoji version {s}\n", .{package.version});
}

fn printHelp() !void {
    try std.io.getStdOut().writer().print("Usage: genmoji [--version] [--help]\n", .{});
}

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    // Skip the first argument (program name) and start processing from the second
    for (args[1..]) |arg| {
        if (std.mem.eql(u8, arg, "--help")) {
            try printHelp();
            return;
        } else if (std.mem.eql(u8, arg, "--version")) {
            try printVersion();
            return;
        } else {
            std.debug.print("Unknown argument: {s}\n", .{arg});
            std.process.exit(0);
        }
    }

    const diff = try git.getStagedChanges(allocator);
    const response = try openai.getCompletion(allocator, diff);

    try std.io.getStdOut().writer().print("{s}\n", .{response.choices[0].message.content});
}

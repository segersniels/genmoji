const std = @import("std");

pub fn getStagedChanges(allocator: std.mem.Allocator) ![]u8 {
    const result = try std.process.Child.run(.{ .allocator = allocator, .argv = &[_][]const u8{
        "git",
        "diff",
        "--cached",
    } });

    if (result.stdout.len == 0) {
        try std.io.getStdOut().writer().print("No changes to commit\n", .{});
        std.process.exit(0);
    }

    return result.stdout;
}

pub fn commit(allocator: std.mem.Allocator, message: []const u8) !void {
    _ = try std.process.Child.run(.{ .allocator = allocator, .argv = &[_][]const u8{
        "git",
        "commit",
        "-m",
        message,
    } });
}

const std = @import("std");

pub fn getStagedChanges(allocator: std.mem.Allocator) ![]u8 {
    const result = try std.process.Child.run(.{ .allocator = allocator, .argv = &[_][]const u8{
        "git",
        "diff",
        "--cached",
    } });

    return result.stdout;
}

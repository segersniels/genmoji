const std = @import("std");
const utils = @import("utils.zig");

const CACHE_FILE = ".genmoji/gitmoji.json";

const Gitmoji = struct {
    emoji: []u8,
    code: []u8,
    description: []u8,
    name: []u8,
};

const Response = struct {
    gitmojis: []Gitmoji,
};

fn getPath(allocator: std.mem.Allocator) !?[]u8 {
    var env = try std.process.getEnvMap(allocator);
    defer env.deinit();

    const homedir = env.get("HOME") orelse {
        return null;
    };

    return try std.fmt.allocPrint(allocator, "{s}/{s}", .{ homedir, CACHE_FILE });
}

fn checkIfExists(path: []u8) bool {
    std.fs.accessAbsolute(path, .{}) catch {
        return false;
    };

    return true;
}

fn fetchFromCache(allocator: std.mem.Allocator) !?Response {
    const path = try getPath(allocator) orelse {
        return null;
    };

    if (!checkIfExists(path)) {
        return null;
    }

    const file = try std.fs.openFileAbsolute(path, .{});
    defer file.close();

    const stat = try file.stat();
    const content = try file.readToEndAlloc(allocator, stat.size);

    return try std.json.parseFromSliceLeaky(Response, allocator, content, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });
}

fn writeToCache(allocator: std.mem.Allocator, data: Response) !void {
    const path = try getPath(allocator) orelse {
        return;
    };

    try std.fs.makeDirAbsolute(std.fs.path.dirname(path).?);
    const file = try std.fs.createFileAbsolute(path, .{ .truncate = true });
    defer file.close();

    const string = try std.json.stringifyAlloc(allocator, data, .{});
    try file.writeAll(string);
}

fn fetchFromRemote(allocator: std.mem.Allocator) !Response {
    const response = try utils.fetch(Response, "https://gitmoji.dev/api/gitmojis", .{
        .allocator = allocator,
        .method = .GET,
    });

    writeToCache(allocator, response) catch |err| {
        std.log.debug("Warning: Ignoring error while writing to cache: {}\n", .{err});
    };

    return response;
}

pub fn fetchGitmojis(allocator: std.mem.Allocator) !Response {
    const cache = fetchFromCache(allocator) catch |err| {
        std.log.debug("Warning: Ignoring error while fetching from cache: {}\n", .{err});

        return try fetchFromRemote(allocator);
    };

    if (cache) |response| {
        return response;
    }

    return try fetchFromRemote(allocator);
}

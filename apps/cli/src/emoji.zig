const std = @import("std");

const Gitmoji = struct {
    emoji: []u8,
    code: []u8,
    description: []u8,
    name: []u8,
};

const Response = struct {
    gitmojis: []Gitmoji,
};

fn determineCacheDirectory(allocator: std.mem.Allocator) !?[]u8 {
    var env = try std.process.getEnvMap(allocator);
    defer env.deinit();

    const homedir = env.get("HOME") orelse {
        return null;
    };

    return try std.fmt.allocPrint(allocator, "{s}/.genmoji", .{homedir});
}

fn determineCacheFilename(allocator: std.mem.Allocator, directory: []u8) !?[]u8 {
    return try std.fmt.allocPrint(allocator, "{s}/gitmoji.json", .{directory});
}

fn readFile(allocator: std.mem.Allocator, filename: []u8) ![]u8 {
    const file = try std.fs.openFileAbsolute(filename, .{});
    defer file.close();

    const stat = try file.stat();
    return try file.readToEndAlloc(allocator, stat.size);
}

fn checkIfExists(path: []u8) bool {
    std.fs.accessAbsolute(path, .{}) catch {
        return false;
    };

    return true;
}

fn fetchFromCache(allocator: std.mem.Allocator) !?Response {
    const directory = try determineCacheDirectory(allocator) orelse {
        return null;
    };

    const filename = try determineCacheFilename(allocator, directory) orelse {
        return null;
    };

    if (!checkIfExists(filename)) {
        return null;
    }

    const file = try std.fs.openFileAbsolute(filename, .{});
    defer file.close();

    const stat = try file.stat();
    const content = try file.readToEndAlloc(allocator, stat.size);
    const data = try std.json.parseFromSlice(Response, allocator, content, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    return data.value;
}

fn writeToCache(allocator: std.mem.Allocator, data: Response) !void {
    const directory = try determineCacheDirectory(allocator) orelse {
        return;
    };

    const filename = try determineCacheFilename(allocator, directory) orelse {
        return;
    };

    try std.fs.makeDirAbsolute(directory);
    const file = try std.fs.createFileAbsolute(filename, .{ .truncate = true });
    defer file.close();

    var string = std.ArrayList(u8).init(allocator);
    try std.json.stringify(data, .{}, string.writer());

    try file.writeAll(string.items);
}

pub fn fetchGitmojis(allocator: std.mem.Allocator) !Response {
    var client: std.http.Client = .{ .allocator = allocator };
    defer client.deinit();

    // Check if we have a cached version of the gitmojis
    if (try fetchFromCache(allocator)) |cache| {
        return cache;
    }

    const headers = std.http.Client.Request.Headers{ .content_type = std.http.Client.Request.Headers.Value{ .override = "application/json" } };
    var body = std.ArrayList(u8).init(allocator);
    _ = try client.fetch(.{ .location = .{ .url = "https://gitmoji.dev/api/gitmojis" }, .method = .GET, .headers = headers, .response_storage = .{ .dynamic = &body } });

    const data = try std.json.parseFromSlice(Response, allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    // Update cache
    try writeToCache(allocator, data.value);

    return data.value;
}

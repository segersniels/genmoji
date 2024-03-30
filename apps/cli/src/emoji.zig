const std = @import("std");

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
    const data = try std.json.parseFromSlice(Response, allocator, content, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    return data.value;
}

fn writeToCache(allocator: std.mem.Allocator, data: Response) !void {
    const path = try getPath(allocator) orelse {
        return;
    };

    try std.fs.makeDirAbsolute(std.fs.path.dirname(path).?);
    const file = try std.fs.createFileAbsolute(path, .{ .truncate = true });
    defer file.close();

    var string = std.ArrayList(u8).init(allocator);
    try std.json.stringify(data, .{}, string.writer());

    try file.writeAll(string.items);
}

pub fn fetchGitmojis(allocator: std.mem.Allocator) !Response {
    var client: std.http.Client = .{ .allocator = allocator };
    defer client.deinit();

    // Check if we have a cached version of the gitmojis
    if (fetchFromCache(allocator)) |cache| {
        // TODO: Figure out a cleaner way to catch the error and only return on actual cache hit
        if (cache) |value| {
            return value;
        }
    } else |err| {
        std.log.debug("Warning: Ignoring error while fetching from cache: {}\n", .{err});
    }

    const headers = std.http.Client.Request.Headers{ .content_type = std.http.Client.Request.Headers.Value{ .override = "application/json" } };
    var body = std.ArrayList(u8).init(allocator);
    _ = try client.fetch(.{ .location = .{ .url = "https://gitmoji.dev/api/gitmojis" }, .method = .GET, .headers = headers, .response_storage = .{ .dynamic = &body } });

    const data = try std.json.parseFromSlice(Response, allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    // Update cache
    writeToCache(allocator, data.value) catch |err| {
        std.log.debug("Warning: Ignoring error while writing to cache: {}\n", .{err});
    };

    return data.value;
}

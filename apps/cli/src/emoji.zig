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

pub fn fetchGitmojis(allocator: std.mem.Allocator) !Response {
    var client: std.http.Client = .{ .allocator = allocator };
    defer client.deinit();

    const headers = std.http.Client.Request.Headers{ .content_type = std.http.Client.Request.Headers.Value{ .override = "application/json" } };
    var body = std.ArrayList(u8).init(allocator);
    _ = try client.fetch(.{ .location = .{ .url = "https://gitmoji.dev/api/gitmojis" }, .method = .GET, .headers = headers, .response_storage = .{ .dynamic = &body } });

    const data = try std.json.parseFromSlice(Response, allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });

    return data.value;
}

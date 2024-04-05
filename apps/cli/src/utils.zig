const std = @import("std");

const InitOptions = struct {
    allocator: std.mem.Allocator,
    method: std.http.Method,
    body: ?[]u8 = null,
    headers: ?std.http.Client.Request.Headers = null,
};

/// Very loosely based on the `fetch` API from JavaScript to make it slightly more user friendly to perform requests
pub fn fetch(comptime T: type, url: []const u8, options: InitOptions) !T {
    var client: std.http.Client = .{ .allocator = options.allocator };
    defer client.deinit();

    const headers = options.headers orelse std.http.Client.Request.Headers{ .content_type = std.http.Client.Request.Headers.Value{ .override = "application/json" } };
    var body = std.ArrayList(u8).init(options.allocator);
    _ = try client.fetch(.{ .location = .{ .url = url }, .method = options.method, .headers = headers, .response_storage = .{ .dynamic = &body }, .payload = options.body });

    return try std.json.parseFromSliceLeaky(T, options.allocator, body.items, .{ .allocate = .alloc_always, .ignore_unknown_fields = true });
}

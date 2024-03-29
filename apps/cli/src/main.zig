const std = @import("std");
const package = @import("package");
const openai = @import("openai.zig");

fn printVersion() !void {
    try std.io.getStdOut().writer().print("genmoji version {s}\n", .{package.version});
}

fn printHelp() !void {
    try std.io.getStdOut().writer().print("Usage: genmoji [--version] [--help]\n", .{});
}

/// TODO: Capture from current staged changes
const PROMPT =
    \\ diff --git a/src/app/product-announcement/page.tsx b/src/app/product-announcement/page.tsx
    \\ index 6284842..8fc5a46 100644
    \\ --- a/src/app/product-announcement/page.tsx
    \\ +++ b/src/app/product-announcement/page.tsx
    \\ @@ -32,7 +32,6 @@ function Card(props: TableProps) {
    \\      <Table>
    \\        <TableHeader>
    \\          <TableRow>
    \\ -          <TableHead>Type</TableHead>
    \\            <TableHead>Title</TableHead>
    \\            <TableHead>Text</TableHead>
    \\            <TableHead>Button Text</TableHead>
    \\ @@ -44,7 +43,6 @@ function Card(props: TableProps) {
    \\        <TableBody>
    \\          {data.map((item) => (
    \\            <TableRow key={item.id}>
    \\ -            <TableCell>{item.type}</TableCell>
    \\              <TableCell>{item.title}</TableCell>
    \\              <TableCell className="max-w-[256px] truncate">
    \\                {item.text}
    \\ @@ -95,7 +93,6 @@ function Module(props: TableProps) {
    \\      <Table>
    \\        <TableHeader>
    \\          <TableRow>
    \\ -          <TableHead>Type</TableHead>
    \\            <TableHead>Title</TableHead>
    \\            <TableHead>Text</TableHead>
    \\            <TableHead>App Version</TableHead>
    \\ @@ -106,7 +103,6 @@ function Module(props: TableProps) {
    \\        <TableBody>
    \\          {data.map((item) => (
    \\            <TableRow key={item.id}>
    \\ -            <TableCell>{item.type}</TableCell>
    \\              <TableCell>{item.title}</TableCell>
    \\              <TableCell className="max-w-[256px] truncate">
    \\                {item.text}
;

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

    const response = try openai.getCompletion(allocator, PROMPT);
    std.debug.print("{s}\n", .{response.choices[0].message.content});
}

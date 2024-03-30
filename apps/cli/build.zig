const std = @import("std");

const targets: []const std.Target.Query = &.{
    .{ .cpu_arch = .aarch64, .os_tag = .macos },
    .{ .cpu_arch = .aarch64, .os_tag = .linux },
    .{ .cpu_arch = .x86_64, .os_tag = .linux, .abi = .gnu },
    .{ .cpu_arch = .x86_64, .os_tag = .linux, .abi = .musl },
};

/// Extract the version information from the `build.zig.zon` config file
///
/// TODO: Figure out a proper way to parse the `.zon` file and extract the version...
pub fn extractVersion(allocator: std.mem.Allocator) !?[]const u8 {
    var version: ?[]const u8 = null;
    const file = try std.fs.cwd().openFile("build.zig.zon", .{});
    defer file.close();
    const stat = try file.stat();
    const content = try file.readToEndAlloc(allocator, stat.size);

    // Go over all lines in the config file
    var lines = std.mem.split(u8, content, "\n");
    while (lines.next()) |line| {
        // Strip the line of any whitespace for easier parsing
        const size = std.mem.replacementSize(u8, line, " ", "");
        const output = try allocator.alloc(u8, size);
        _ = std.mem.replace(u8, line, " ", "", output);

        // Split on comma to get the key and value
        var chunks = std.mem.splitSequence(u8, output, ",");
        while (chunks.next()) |chunk| {
            if (!std.mem.startsWith(u8, chunk, ".version")) {
                continue;
            }

            // Extract the value out of it
            var it = std.mem.splitSequence(u8, chunk, "=");
            while (it.next()) |word| {
                version = word;
            }
        }
    }

    return version;
}

pub fn build_impl(b: *std.Build, target: std.Build.ResolvedTarget, optimize: std.builtin.OptimizeMode) !*std.Build.Step.Compile {
    const exe = b.addExecutable(.{
        .name = "genmoji",
        // In this case the main source file is merely a path, however, in more
        // complicated build scripts, this could be a generated file.
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    const zigcli_dep = b.dependency("zig-cli", .{ .target = target });
    const zigcli_mod = zigcli_dep.module("zig-cli");
    exe.root_module.addImport("zig-cli", zigcli_mod);

    // Expose the specified version from build.zig.zon to the executable
    var options = b.addOptions();
    if (try extractVersion(b.allocator)) |version| {
        options.addOption([]const u8, "version", version);
        exe.root_module.addOptions("package", options);
    }

    // Add the executable to the install step, which will copy it to the
    // installation directory.
    const target_output = b.addInstallArtifact(exe, .{
        .dest_dir = .{
            .override = .{
                .custom = try target.result.zigTriple(b.allocator),
            },
        },
    });

    b.getInstallStep().dependOn(&target_output.step);

    return exe;
}

// Although this function looks imperative, note that its job is to
// declaratively construct a build graph that will be executed by an external
// runner.
pub fn build(b: *std.Build) !void {
    var env = try std.process.getEnvMap(b.allocator);
    defer env.deinit();

    const is_ci_environment = env.get("CI") orelse "false";

    // Standard optimization options allow the person running `zig build` to select
    // between Debug, ReleaseSafe, ReleaseFast, and ReleaseSmall. Here we do not
    // set a preferred release mode, allowing the user to decide how to optimize.
    const optimize = b.standardOptimizeOption(.{
        .preferred_optimize_mode = .ReleaseSafe,
    });

    if (std.mem.eql(u8, is_ci_environment, "true")) {
        for (targets) |t| {
            _ = try build_impl(b, b.resolveTargetQuery(t), optimize);
        }
    } else {
        // Standard target options allows the person running `zig build` to choose
        // what target to build for. Here we do not override the defaults, which
        // means any target is allowed, and the default is native. Other options
        // for restricting supported target set are available.
        const target = b.standardTargetOptions(.{});
        const exe = try build_impl(b, target, optimize);

        // This *creates* a Run step in the build graph, to be executed when another
        // step is evaluated that depends on it. The next line below will establish
        // such a dependency.
        const run_cmd = b.addRunArtifact(exe);

        // By making the run step depend on the install step, it will be run from the
        // installation directory rather than directly from within the cache directory.
        // This is not necessary, however, if the application depends on other installed
        // files, this ensures they will be present and in the expected location.
        run_cmd.step.dependOn(b.getInstallStep());

        // This allows the user to pass arguments to the application in the build
        // command itself, like this: `zig build run -- arg1 arg2 etc`
        if (b.args) |args| {
            run_cmd.addArgs(args);
        }

        // This creates a build step. It will be visible in the `zig build --help` menu,
        // and can be selected like this: `zig build run`
        // This will evaluate the `run` step rather than the default, which is "install".
        const run_step = b.step("run", "Run the app");
        run_step.dependOn(&run_cmd.step);

        // Creates a step for unit testing. This only builds the test executable
        // but does not run it.
        const unit_tests = b.addTest(.{
            .root_source_file = .{ .path = "src/main.zig" },
            .target = target,
            .optimize = optimize,
        });

        const run_unit_tests = b.addRunArtifact(unit_tests);

        // Similar to creating the run step earlier, this exposes a `test` step to
        // the `zig build --help` menu, providing a way for the user to request
        // running the unit tests.
        const test_step = b.step("test", "Run unit tests");
        test_step.dependOn(&run_unit_tests.step);
    }
}

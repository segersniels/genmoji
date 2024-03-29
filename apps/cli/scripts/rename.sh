#!/bin/sh

SOURCE_DIR="zig-out"
TARGET_DIR="bin"

# Create the target directory if it doesn't exist yet
mkdir -p $TARGET_DIR

# Iterate over files in zig-out using find
find "$SOURCE_DIR" -type f | while IFS= read -r src_path; do
  # Remove the 'zig-out/' prefix
  relative_path="$(echo "$src_path" | sed "s|^$SOURCE_DIR/||")"

  # Replace remaining slashes with dashes
  new_filename="$(echo "$relative_path" | sed 's|/|-|g')"

  # Construct the target path
  target_path="$TARGET_DIR/$new_filename"

  # Move and rename the file
  mv "$src_path" "$target_path"
done

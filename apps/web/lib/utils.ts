import { MetaArgs } from '@remix-run/cloudflare';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type ServerRuntimeMetaDescriptor } from '@remix-run/server-runtime';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extends the metadata of a route by combining parent metadata with new metadata.
 * This function merges metadata from parent routes with the current route's metadata,
 * ensuring that new entries override existing ones with the same title, name, or property.
 *
 * @param matches - An array of route matches from Remix's MetaArgs
 * @param meta - An array of new metadata descriptors to be added or updated
 * @returns A combined array of metadata descriptors
 */
export function extendMeta(
  matches: MetaArgs['matches'],
  meta: ServerRuntimeMetaDescriptor[]
): ServerRuntimeMetaDescriptor[] {
  const parentMeta: ServerRuntimeMetaDescriptor[] = matches
    .flatMap((match) => match.meta ?? [])
    .filter(
      (item) =>
        !meta.some((metaItem) => {
          const hasSameTitle = 'title' in item && 'title' in metaItem;
          const hasSameName =
            'name' in item && 'name' in metaItem && item.name === metaItem.name;
          const hasSameProperty =
            'property' in item &&
            'property' in metaItem &&
            item.property === metaItem.property;

          return hasSameTitle || hasSameName || hasSameProperty;
        })
    );

  return [...parentMeta, ...meta];
}

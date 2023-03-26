import type { NextApiRequest, NextApiResponse } from 'next';
import { generate } from 'lib/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const prompt = `
    Refer to the provided git diff or code snippet and provide a suitable gitmoji commit message.
    When reviewing the diff or code, focus on identifying the main purpose of the changes.
    Are they fixing a bug, adding a new feature, improving performance or readability, or something else?
    Use this information to craft a concise and meaningful gitmoji commit message that clearly indicates what the provided snippet does.
    Remember, clarity and conciseness are key. Use simple language and avoid technical jargon.
    A good commit message should provide enough information to understand the changes without being too verbose.

    To help you understand what works and what doesn't, here are some examples of good and bad commit messages:
    Good: :sparkles: Add new feature for user authentication
    Bad: :rocket: Update code

    Additionally, here is a list of gitmoji codes and their meanings:

    :art: - Improve structure / format of the code.
    :zap: - Improve performance.
    :fire: - Remove code or files.
    :bug: - Fix a bug.
    :ambulance: - Critical hotfix.
    :sparkles: - Introduce new features.
    :memo: - Add or update documentation.
    :rocket: - Deploy stuff.
    :lipstick: - Add or update the UI and style files.
    :tada: - Begin a project.
    :white_check_mark: - Add, update, or pass tests.
    :lock: - Fix security issues.
    :closed_lock_with_key: - Add or update secrets.
    :bookmark: - Release / Version tags.
    :rotating_light: - Fix compiler / linter warnings.
    :construction: - Work in progress.
    :green_heart: - Fix CI Build.
    :arrow_down: - Downgrade dependencies.
    :arrow_up: - Upgrade dependencies.
    :pushpin: - Pin dependencies to specific versions.
    :construction_worker: - Add or update CI build system.
    :chart_with_upwards_trend: - Add or update analytics or track code.
    :recycle: - Refactor code.
    :heavy_plus_sign: - Add a dependency.
    :heavy_minus_sign: - Remove a dependency.
    :wrench: - Add or update configuration files.
    :hammer: - Add or update development scripts.
    :globe_with_meridians: - Internationalization and localization.
    :pencil2: - Fix typos.
    :poop: - Write bad code that needs to be improved.
    :rewind: - Revert changes.
    :twisted_rightwards_arrows: - Merge branches.
    :package: - Add or update compiled files or packages.
    :alien: - Update code due to external API changes.
    :truck: - Move or rename resources (e.g.: files, paths, routes).
    :page_facing_up: - Add or update license.
    :boom: - Introduce breaking changes.
    :bento: - Add or update assets.
    :wheelchair: - Improve accessibility.
    :bulb: - Add or update comments in source code.
    :beers: - Write code drunkenly.
    :speech_balloon: - Add or update text and literals.
    :card_file_box: - Perform database related changes.
    :loud_sound: - Add or update logs.
    :mute: - Remove logs.
    :busts_in_silhouette: - Add or update contributor(s).
    :children_crossing: - Improve user experience / usability.
    :building_construction: - Make architectural changes.
    :iphone: - Work on responsive design.
    :clown_face: - Mock things.
    :egg: - Add or update an easter egg.
    :see_no_evil: - Add or update a .gitignore file.
    :camera_flash: - Add or update snapshots.
    :alembic: - Perform experiments.
    :mag: - Improve SEO.
    :label: - Add or update types.
    :seedling: - Add or update seed files.
    :triangular_flag_on_post: - Add, update, or remove feature flags.
    :goal_net: - Catch errors.
    :dizzy: - Add or update animations and transitions.
    :wastebasket: - Deprecate code that needs to be cleaned up.
    :passport_control: - Work on code related to authorization, roles and permissions.
    :adhesive_bandage: - Simple fix for a non-critical issue.
    :monocle_face: - Data exploration/inspection.
    :coffin: - Remove dead code.
    :test_tube: - Add a failing test.
    :necktie: - Add or update business logic.
    :stethoscope: - Add or update healthcheck.
    :bricks: - Infrastructure related changes.
    :technologist: - Improve developer experience.
    :money_with_wings: - Add sponsorships or money related infrastructure.
    :thread: - Add or update code related to multithreading or concurrency.
    :safety_vest: - Add or update code related to validation.

    When reviewing a diff, pay attention to the changed filenames and use this information to extract the context of the changes.
    This will help you create a more relevant and informative commit message.
    If the user provides additional context, use it to further refine your message. But remember, the message should still be clear and concise.
    Finally, always start your gitmoji commit message with a gitmoji followed by the commit message starting with a capital letter.

    ${req.body.code}

    Optional additional context below:

    ${req.body.context}
`;

  const message = await generate(prompt);

  return res.status(200).json({ message });
}

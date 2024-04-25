## Immediate TODO

-   Simplify all styling

0. BUGS

-   check github issues and check against them

1. Character Sheet

-   fix headers
-   fix styling

2. Compendium browser

    - Re-enable listeners and drag-drop
        - re-ordering
        - dropdown
    - Implement item ghosts

3. Character config sheet

    - Ensure functionality
    - Finish styling

4. Character point breakdown

    - Reimplement

5. Modifier Bucket

    - Reimplement missing functionality

6. Mook Generator

    - Reimplement missing functionality

7. Migration

    - Implement full actor/item migration from 0.16 to 1.0
        - Implement migration for equipment_gcs and character_gcs old versions to unified one

8. The Forge

    - Ensure everything works correctly on the forge

9. Trait Container Ancestry

    - Implement

# TO DO

## In Progress

-   Finish "static" character (0.15 and older) compatibility
-   don't bother with editing features
-   mook generator
-   implement name matching from imported libraries

## Jeff and Chris

-   Finish the Damage Calculator conversion
-   fix random hit location chat message so it doesn't look bad
-   Convert OTFs and chat commands
-   Drag rollable buttons to hotbar or message box for macros
-   update Nordlond sheet & compendium entries with dynamic characters

## 1.0.0

-   Implement "static" items (0.15 and older) compatibility
-   add interface for accessing old bonuses
-   fix GURPS.LastActor metting,
-   Convert over module compatibility
-   Token Action HUD
-   Convert the modifier bucket over
    -   modifier bucket journals (waiting for OTFs)
-   Add makeshift static to dynamic character conversion
-   Delete compendium pack entries in settings when compendium pack is removed
-   style cleanup
-   test coverage
-   dice generation
-   Globally visible modifier for rough terrain, darkness, etc.

## 1.1.0 and beyond

-   Optional ADD settings
-   id match attributes to be treated differently
-   HP, Ablative DR?, resource trackers too, to be used as HP
-   FP, Energy Reserve, Power Items as resource trackers, used as FP?
-   Radiation, Radiation Shielding would apply
-   Stop flattening compendiums on import
-   Proper hex size support with rotation
-   Editable maneuver grid, editable condition grid
-   Dynamic Character changes
    -   add move advantage parsing (by name? or feature? or VTT notes?) for "Flight", "Walk on Air".
        the names parsed should be customizable via an object-type system setting. the names(?) value should be an array of strings
-   support rollable bonuses
-   Skill Defaults from compendium
-   account for any skill bonuses which should not apply to defaults
-   Incorporate v10 tooltip API
-   m Drag items to chat, get item chat entry with name, notes, rollables, etc.
-   completely redo the way roll messages are handled
-   default roll templates are re-rendered when opening the world, while ours are static
    changing this so the templates are dynamic would improve the way they are handled in the future
-   send modifiers from prompt
-   Tech Level Modifiers (B168)
-   when skill is rolled from tree, show which skill is rolled
-   (compact) NPC sheet
-   roll skills based on other attributes
-   add way to hide specific result, target, and mods of roll but just show success/failure/crit
-   reimporting a character over another one doesn't visibly change portrait until refresh because it is stored in cache. fix?
-   Global Foundry styling
-   import/export for settings (colors, attributes, body type, resource trackers, sheet settings)
-   Finish GCA5 direct import
    -   prereqs (leave for later)
    -   appearance
    -   finish features
    -   meta-traits
    -   racial templates
    -   alternate abilities
-   mass import characters (add to library browser)
-   autofill bio
-   Fix textarea height
-   focus on field of newly created attribute/location/etc. on creation
-   GCS 5.3 Template support
-   Vehicles
    -   Spaceships
    -   3e(?) Vehicles
-   Mass Combat Elements
-   Mook Generator
    -   Autocomplete traits, skills, etc. from compendiums
-   G-Force calculator (affects encumbrance & move)
    -   Toggleable sidebar button
    -   Affects clicked on tokens / current map / current character
-   Support rolling on custom hit location tables (e.g. grand unified hit location table)
-   Tours implementation for UI
-   Roll20 style notes about character in place of character sheet (for players with limited access?)
-   fully customizable sheet layout with dragging around elements
-   Library Import
    -   Overwrite items instead of appending
    -   When importing to world items, overwrite items with the same GCS UUID
-   Sort character items on import
-   Polygot module support for Dynamic Characters
-   Add "children" section to sheets for items which can have children
-   Add native hex token size support (especially for elongated hexes)
-   Add native "drag ruler" type support
    -   Color green within maneuver range
    -   Color yellow for one hex (1FP extra effort?/extra step) maybe toggleable
-   GURPS Token Settings
    -   A small grid is presented in the window, with your image in the middle. You can manipulate the size of the image to match your aesthetic needs.
-   There is also a "hex-side" choosing option on this grid, wherein you choose which sides of which hexes should count as Front, Side, or Back. Whether or not this has any mechanical difference will remain to be seen, but it's a possibility.
-   There is a checkbox allowing you to toggle a "hex frame" for your token, which may be rendered as part of the token image. - Color red beyond limit
-   Weapon Robustness secret rolls Pyramid #3-87:6
-   Add option to hide current PC HP from player, showing only condition.
-   When having multiple tokens selected, applying a status effect to one applies it to all selected

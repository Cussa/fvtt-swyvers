# Foundry's Swyvers System

![](docs/logo-yellow.webp)

> [!WARNING]
> ## 🚧 System Under Development
> 
> **Important Notice:** This system is currently in active development. Consider the current releases as "alpha", which implies that breaking changes may occur. While I strive to minimize disruptions, they are sometimes unavoidable. 
> 
> Please use the system with this in mind, understanding that changes are ongoing, particularly as I develop the Swyvers premium module. Your patience and feedback are greatly appreciated as we work towards refining and stabilizing the system.
>
> If you find any issue, please, use this repository to report it.

## System Features

- Items:
  - Weapon
  - Armour
  - Skill
  - Spell
  - Extra things... (see more below)
- Actors:
  - Character Sheet
    - Roll Fighting Skill: uses the fight roll rule, and allows to include bonus/penalties for the roll
    - Roll Constitution, Dexterity and Strength attributes: uses the logic of roll under, and choose the number of dice
    - Inventory system
      - Create simple items called "Backpack" and "Sack" to give player access to it.
      - Control the HP, insert Special information (no automations) and if character is literated
      - Edit the item to choose where it is being carried
      - Alerts in case more items than allowed get in a container
      - Auto-calculates the `Dex` penalties if carrying more than alloweed.
      - Roll weapon damage and armour soak damage
    - Auto calculate the defense value, based on the weapon being used and if player has a shield
    - Skills
      - Allow you to roll under (hollow dice) or roll as high (fill dice)
      - When rolling under, choose the number of dice to roll.
    - Spells
      - Allows to cast spell, using the blackjack system.
        - Hit will get a new card, stand will stop the progress and keep the current total.
        - If spell gets a failure, make it unavailable until the next day.
  - NPC Sheet
    - Uses the same weapon and armour to prepare the attacks and defenses
    - Has the possibility to have spells too.
    - Has some extra information related to defense bonus, innitiative bonus (not used yet) and movement.

### What is still missing?
- Character sheet
  - Roll attributes when creating a character (and set the HP equals to Constitution)
  - Roll Literate chance
  - Roll starting money
  - Roll Trinket
  - Roll Trait
  - Level / Experience information
  - Prosthetics and Ailments/Trauma
  - Fences
  - Criminal Record
  - Damage control (for when the character has less than 0 HP)
- Implement the coin system
- Alternate Starts (with different rolls and info)
- Starter Kits
- Improve some layouts

## Bugs

As this is still in development, bugs are expected, hence the warning above.
If you find something that is not listed above, or that you believe that is an issue, please, open a ticket on the repository.

<details>
<summary><h2>Information for GMs' eyes only! Players, go away!</h2></summary>

### Spells
Magic on the game has more things than mentioned before. To handle some of that things, we implemented two new item types: `spell components` and `despots`.

#### Changes on the Character sheet
Because of the requirements for spell, GMs will have two extra informations on the character sheet: Magic Knowledge and Despot.

When you select the Magic Knowledge `Level 1`, it will start to show the spell suit and the suit effect to the player.

When you select the Magic Knowledge `Level 2`, the player will start to see the `Spell Componenets` (see below) as what they are: Spell Components (and not `"Strange" item`, as they see when they don't have this knowledge). However, having the knowledge about spell component does not automatically tells them what that does (or, in game mechanics, what card is associated with it). To give the player access to that information, edit the spell component in their character sheet, and you will see a new checkbox "Show Card Info". That will give them this access.

When you select the Magic Knowledge `Level 3`, they will start to see the despot associated to them, if they have one.

#### Spell Component
When you create a spell component, it has a card associated. When you add that item to the player, it will appear as `"Strange" item` until they get Magic Knowledge `Level 2`. However, you still need to give them access to the Card info.

When they cast a spell, if they have some spell component in their inventory, it will present a pop-up with the list of spell components, allowing them to select one of that. Remember: the spell component is sacrified during the usage, which means that we delete the item from their inventory automatically.

#### Despot
Despots are related to one of the faced cards of the deck.

A character can have only one despot associated to them.

When casting a spell, if the character has a despot associated, it will present the pop asking if they want to use the despot card.

Both Despot cards and Spell Component cards doesn't come from the deck. This means that a character is still able to cast a spell successfully if they have a despot and a spell component with a card that has a value greater or equal seven, even if the deck is empty (magic resources depleted for the day).
</details>
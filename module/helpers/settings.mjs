export function registerSettings() {
  game.settings.register("swyvers", "magicDeckId", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register("swyvers", "magicPileId", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}
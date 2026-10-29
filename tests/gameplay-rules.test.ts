import test from "node:test";
import assert from "node:assert/strict";
import {
  STARGATE_TURN_INTERVAL_MS,
  generateStargateTurns,
  calculateStargateNaturalIncome,
  calculateStargateBankCapacity,
  calculateNextUnitProductionCost,
  calculateOGameProduction,
  calculateOGameBuildingCost,
} from "../shared/gameplay/stargateOGameRules";

test("StargateWars generates one turn per completed 30-minute interval", () => {
  const start = 1_000_000;
  const result = generateStargateTurns(
    { currentTurns: 0, totalTurnsGenerated: 0, lastTurnTimestamp: start },
    start + STARGATE_TURN_INTERVAL_MS * 3 + 10_000,
  );
  assert.equal(result.turnsAdded, 3);
  assert.equal(result.state.currentTurns, 3);
  assert.equal(result.state.lastTurnTimestamp, start + STARGATE_TURN_INTERVAL_MS * 3);
});

test("turn generation pauses at 4,000 stored turns and caps at 10,000", () => {
  const start = 2_000_000;
  const paused = generateStargateTurns(
    { currentTurns: 4_000, totalTurnsGenerated: 4_000, lastTurnTimestamp: start },
    start + STARGATE_TURN_INTERVAL_MS * 5,
  );
  assert.equal(paused.turnsAdded, 0);
  assert.equal(paused.pausedAtStorageThreshold, true);
  const capped = generateStargateTurns(
    { currentTurns: 9_999, totalTurnsGenerated: 9_999, lastTurnTimestamp: start },
    start + STARGATE_TURN_INTERVAL_MS * 5,
  );
  assert.equal(capped.state.currentTurns, 10_000);
  assert.equal(capped.turnsAdded, 1);
});

test("invalid and backwards timestamps never generate negative turns", () => {
  const result = generateStargateTurns(
    { currentTurns: 10, totalTurnsGenerated: 10, lastTurnTimestamp: 5_000 },
    4_000,
  );
  assert.equal(result.turnsAdded, 0);
  assert.equal(result.state.currentTurns, 10);
});

test("StargateWars natural income, bank capacity and UP cost use documented formulas", () => {
  assert.equal(calculateStargateNaturalIncome(10, 5), 600);
  assert.equal(calculateStargateBankCapacity(600), 43_200);
  assert.equal(calculateNextUnitProductionCost(20), 110_000);
  assert.equal(calculateStargateNaturalIncome(-1, 2), 160);
});

test("OGame hourly production scales with mine levels and energy research", () => {
  assert.deepEqual(calculateOGameProduction(
    { metalMine: 10, crystalMine: 5, deuteriumSynthesizer: 6 },
    { energyTech: 4 },
  ), { metal: 600, crystal: 150, deuterium: 90, energy: 40 });
});

test("building costs compound by 15 percent per existing level", () => {
  assert.deepEqual(calculateOGameBuildingCost(
    { metal: 60, crystal: 15, deuterium: 0 }, 2,
  ), { metal: 79, crystal: 19, deuterium: 0 });
});

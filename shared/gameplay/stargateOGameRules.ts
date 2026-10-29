/**
 * Shared, deterministic rules for the StargateWars + OGame economy.
 * Pure functions only: safe to use from API handlers and unit tests.
 */
export const STARGATE_TURN_INTERVAL_MS = 30 * 60 * 1000;
export const STARGATE_MAX_STORED_TURNS = 10_000;
export const STARGATE_GENERATION_PAUSE_AT = 4_000;
export const STARGATE_BANK_CAPACITY_MULTIPLIER = 48 * 1.5;

export interface TurnState {
  currentTurns: number;
  totalTurnsGenerated: number;
  lastTurnTimestamp: number;
}
export interface TurnGenerationResult {
  state: TurnState;
  turnsAdded: number;
  intervalsElapsed: number;
  pausedAtStorageThreshold: boolean;
}

/** Generate one StargateWars turn every 30 minutes, with bounded storage. */
export function generateStargateTurns(
  input: TurnState,
  now: number,
): TurnGenerationResult {
  const currentTurns = clampInteger(input.currentTurns, 0, STARGATE_MAX_STORED_TURNS);
  const totalTurnsGenerated = clampInteger(input.totalTurnsGenerated, 0, Number.MAX_SAFE_INTEGER);
  const lastTurnTimestamp = Number.isFinite(input.lastTurnTimestamp)
    ? Math.min(now, Math.max(0, input.lastTurnTimestamp))
    : now;
  const intervalsElapsed = Math.floor(Math.max(0, now - lastTurnTimestamp) / STARGATE_TURN_INTERVAL_MS);
  const pausedAtStorageThreshold = currentTurns >= STARGATE_GENERATION_PAUSE_AT;
  const turnsAdded = pausedAtStorageThreshold
    ? 0
    : Math.min(intervalsElapsed, STARGATE_MAX_STORED_TURNS - currentTurns);
  // Advance only by complete intervals, so partial elapsed time is not discarded.
  const nextTimestamp = lastTurnTimestamp + intervalsElapsed * STARGATE_TURN_INTERVAL_MS;
  return {
    state: {
      currentTurns: currentTurns + turnsAdded,
      totalTurnsGenerated: totalTurnsGenerated + turnsAdded,
      lastTurnTimestamp: nextTimestamp,
    },
    turnsAdded,
    intervalsElapsed,
    pausedAtStorageThreshold,
  };
}

export function calculateStargateNaturalIncome(untrainedUnits: number, minersAndLifers: number): number {
  return Math.max(0, finite(untrainedUnits)) * 20 + Math.max(0, finite(minersAndLifers)) * 80;
}

export function calculateStargateBankCapacity(naturalIncome: number): number {
  return Math.max(0, finite(naturalIncome)) * STARGATE_BANK_CAPACITY_MULTIPLIER;
}

export function calculateNextUnitProductionCost(currentUP: number): number {
  return Math.max(0, finite(currentUP)) * 5_000 + 10_000;
}

export function calculateOGameProduction(
  buildings: Record<string, number> = {},
  research: Record<string, number> = {},
) {
  const level = (key: string) => Math.max(0, finite(buildings[key]));
  const tech = (key: string) => Math.max(0, finite(research[key]));
  const metalMine = level("metalMine");
  const crystalMine = level("crystalMine");
  const deuteriumSynthesizer = level("deuteriumSynthesizer");
  return {
    metal: Math.floor(30 * metalMine * (1 + metalMine / 10)),
    crystal: Math.floor(20 * crystalMine * (1 + crystalMine / 10)),
    deuterium: Math.floor(10 * deuteriumSynthesizer * (1 + deuteriumSynthesizer / 12)),
    energy: Math.floor(20 + tech("energyTech") * 5),
  };
}

export function calculateOGameBuildingCost(
  baseCost: { metal: number; crystal: number; deuterium: number },
  currentLevel: number,
) {
  const factor = Math.pow(1.15, Math.max(0, finite(currentLevel)));
  return {
    metal: Math.floor(baseCost.metal * factor),
    crystal: Math.floor(baseCost.crystal * factor),
    deuterium: Math.floor(baseCost.deuterium * factor),
  };
}

function finite(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(finite(value))));
}

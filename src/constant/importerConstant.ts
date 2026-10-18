// Stat and slot property mappings for external importers (HoYoLAB & Fribbels)
// Extracted and verified 1:1 against neonteam production bundle (srtools.neonteam.dev)

/**
 * HoYoLAB property_type ID to Honkai: Star Rail internal Property string mapping (xr in srtools).
 * Verified 100% identical to srtools production bundle.
 */
export const hoyolabPropertyTypeMap: Record<number, string> = {
    1: "HPDelta",
    2: "AttackDelta",
    3: "DefenceDelta",
    4: "SpeedDelta",
    5: "CriticalChanceBase",
    6: "CriticalDamageBase",
    7: "HealRatioBase",
    9: "SPRatioBase",
    10: "StatusProbabilityBase",
    11: "StatusResistanceBase",
    12: "PhysicalAddedRatio",
    14: "FireAddedRatio",
    16: "IceAddedRatio",
    18: "ThunderAddedRatio",
    20: "WindAddedRatio",
    22: "QuantumAddedRatio",
    24: "ImaginaryAddedRatio",
    26: "HPDelta",
    27: "HPDelta",
    28: "AttackDelta",
    29: "AttackDelta",
    30: "DefenceDelta",
    31: "DefenceDelta",
    32: "HPAddedRatio",
    33: "AttackAddedRatio",
    34: "DefenceAddedRatio",
    35: "SpeedDelta",
    51: "SpeedDelta",
    52: "CriticalChanceBase",
    53: "CriticalDamageBase",
    54: "SPRatioBase",
    55: "HealRatioBase",
    56: "StatusProbabilityBase",
    57: "StatusResistanceBase",
    58: "BreakDamageAddedRatioBase",
    59: "BreakDamageAddedRatioBase",
};

/**
 * Fribbels internal stat enum definitions (Xt in srtools).
 */
export const fribbelsStatEnum = {
    ATK_P: "ATK%",
    ATK: "ATK",
    BE: "Break Effect",
    CD: "CRIT DMG",
    CR: "CRIT Rate",
    DEF_P: "DEF%",
    DEF: "DEF",
    EHR: "Effect Hit Rate",
    ERR: "Energy Regeneration Rate",
    Fire_DMG: "Fire DMG Boost",
    HP_P: "HP%",
    HP: "HP",
    Ice_DMG: "Ice DMG Boost",
    Imaginary_DMG: "Imaginary DMG Boost",
    Lightning_DMG: "Lightning DMG Boost",
    OHB: "Outgoing Healing Boost",
    Physical_DMG: "Physical DMG Boost",
    Quantum_DMG: "Quantum DMG Boost",
    RES: "Effect RES",
    SPD: "SPD",
    Wind_DMG: "Wind DMG Boost",
} as const;

/**
 * Fribbels stat name to Honkai: Star Rail internal Property string mapping (_r in srtools).
 * Includes both full display names from Fribbels exports and internal short codes (Xt).
 * Verified 100% compatible and identical to srtools production bundle.
 */
export const fribbelsStatMap: Record<string, string> = {
    // Official display stat names in Fribbels HSR optimizer export
    "HP": "HPDelta",
    "ATK": "AttackDelta",
    "DEF": "DefenceDelta",
    "SPD": "SpeedDelta",
    "CRIT Rate": "CriticalChanceBase",
    "CRIT DMG": "CriticalDamageBase",
    "Outgoing Healing Boost": "HealRatioBase",
    "Energy Regeneration Rate": "SPRatioBase",
    "Effect Hit Rate": "StatusProbabilityBase",
    "Effect RES": "StatusResistanceBase",
    "Physical DMG Boost": "PhysicalAddedRatio",
    "Fire DMG Boost": "FireAddedRatio",
    "Ice DMG Boost": "IceAddedRatio",
    "Lightning DMG Boost": "ThunderAddedRatio",
    "Wind DMG Boost": "WindAddedRatio",
    "Quantum DMG Boost": "QuantumAddedRatio",
    "Imaginary DMG Boost": "ImaginaryAddedRatio",
    "HP%": "HPAddedRatio",
    "ATK%": "AttackAddedRatio",
    "DEF%": "DefenceAddedRatio",
    "Break Effect": "BreakDamageAddedRatioBase",

    // Fallback aliases matching raw keys from Fribbels internal enum Xt
    "ATK_P": "AttackAddedRatio",
    "DEF_P": "DefenceAddedRatio",
    "HP_P": "HPAddedRatio",
    "CR": "CriticalChanceBase",
    "CD": "CriticalDamageBase",
    "EHR": "StatusProbabilityBase",
    "ERR": "SPRatioBase",
    "BE": "BreakDamageAddedRatioBase",
    "OHB": "HealRatioBase",
    "RES": "StatusResistanceBase",
    "Physical_DMG": "PhysicalAddedRatio",
    "Fire_DMG": "FireAddedRatio",
    "Ice_DMG": "IceAddedRatio",
    "Lightning_DMG": "ThunderAddedRatio",
    "Wind_DMG": "WindAddedRatio",
    "Quantum_DMG": "QuantumAddedRatio",
    "Imaginary_DMG": "ImaginaryAddedRatio",
};

/**
 * Fribbels relic slot / part name mapping to firefly-tools slot type (aq in srtools).
 * Maps {Head, Hands, Body, Feet, PlanarSphere, LinkRope} -> {HEAD, HAND, BODY, FOOT, NECK, OBJECT}.
 */
export const fribbelsPartMap: Record<string, string> = {
    // Standard NeonTeam mapping (aq in srtools)
    "Head": "HEAD",
    "Hands": "HAND",
    "Body": "BODY",
    "Feet": "FOOT",
    "PlanarSphere": "NECK",
    "LinkRope": "OBJECT",

    // Case-insensitive and alternate aliases for robust parsing
    "head": "HEAD",
    "hands": "HAND",
    "body": "BODY",
    "feet": "FOOT",
    "foot": "FOOT",
    "planarsphere": "NECK",
    "sphere": "NECK",
    "linkrope": "OBJECT",
    "rope": "OBJECT",
};

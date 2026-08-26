export interface Metadata {
    BaseType: Record<string, BaseTypeData>;
    DamageType: Record<string, DamageTypeData>;
    MainAffix: Record<string, Record<string, MainAffixData>>;
    SubAffix: Record<string, Record<string, SubAffixData>>;
    SkillConfig: Record<string, SkillMaxLevelData>;
    Stage: Record<string, StageData>;
    HardLevelConfig: Record<string, Record<string, HardLevelData>>;
    EliteConfig: Record<string, EliteData>;
}

export interface HardLevelData {
    AttackRatio: number
    DefenceRatio: number
    HPRatio: number
    SpeedRatio: number
    StanceRatio: number
}

export interface EliteData {
    AttackRatio: number
    DefenceRatio: number
    HPRatio: number
    SpeedRatio: number
    StanceRatio: number
}

export interface StageData {
    ID: number;
    Name: Record<string, string>;
}

export interface BaseTypeData {
    Text: Record<string, string>;
    Icon: string;
}

export interface DamageTypeData {
    Name: Record<string, string>;
    Icon: string;
}

export interface MainAffixData {
    Property: string;
    BaseValue: number;
    LevelAdd: number;
}

export interface SubAffixData {
    Property: string;
    BaseValue: number;
    StepValue: number;
    StepNum: number;
}

export interface SkillMaxLevelData {
    MaxLevel: number;
    IndexSlot: number;
}

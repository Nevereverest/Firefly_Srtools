export const listCurrentLanguage = {
    en: { label: "English", flag: "🇬🇧" },
    vi: { label: "Tiếng Việt", flag: "🇻🇳" },
    ja: { label: "日本語", flag: "🇯🇵" },
    ko: { label: "한국어", flag: "🇰🇷" },
    zh: { label: "中文", flag: "🇨🇳" },
    de: { label: "Deutsch", flag: "🇩🇪" },
    es: { label: "Español", flag: "🇪🇸" },
    fr: { label: "Français", flag: "🇫🇷" },
    id: { label: "Bahasa Indonesia", flag: "🇮🇩" },
    pt: { label: "Português", flag: "🇵🇹" },
    ru: { label: "Русский", flag: "🇷🇺" },
    th: { label: "ไทย", flag: "🇹🇭" }
};

export const listCurrentLanguageApi : Record<string, string> = {
    ja: "jp",
    ko: "kr",
    en: "en",
    vi: "vi",
    zh: "cn",
    de: "de",
    es: "es",
    fr: "fr",
    id: "id",
    pt: "pt",
    ru: "ru",
    th: "th"
};

export const mappingStats = <Record<string, {name: string, icon: string, unit: string, baseStat: string}> > {
    "HPDelta": {
        name:"HP",
        icon:"spriteoutput/ui/avatar/icon/IconMaxHP.png",
        unit: "",
        baseStat: "HP"
    },
    "AttackDelta": {
        name:"ATK",
        icon:"spriteoutput/ui/avatar/icon/IconAttack.png",
        unit: "",
        baseStat: "ATK"
    },
    "HPAddedRatio": {
        name:"HP",
        icon:"spriteoutput/ui/avatar/icon/IconMaxHP.png",
        unit: "%",
        baseStat: "HP"
    },
    "AttackAddedRatio": {
        name:"ATK",
        icon:"spriteoutput/ui/avatar/icon/IconAttack.png",
        unit: "%",
        baseStat: "ATK"
    },
    "DefenceDelta": {
        name:"DEF",
        icon:"spriteoutput/ui/avatar/icon/IconDefence.png",
        unit: "",
        baseStat: "DEF"
    },
    "DefenceAddedRatio": {
        name:"DEF",
        icon:"spriteoutput/ui/avatar/icon/IconDefence.png",
        unit: "%",
        baseStat: "DEF"
    },
    "SpeedAddedRatio": {
        name:"SPD",
        icon:"spriteoutput/ui/avatar/icon/IconSpeed.png",
        unit: "%",
        baseStat: "SPD"
    },
    "BaseSpeed": {
        name:"SPD",
        icon:"spriteoutput/ui/avatar/icon/IconSpeed.png",
        unit: "",
        baseStat: "SPD"
    },
    "CriticalChanceBase": {
        name:"CRIT Rate",
        icon:"spriteoutput/ui/avatar/icon/IconCriticalChance.png",
        unit: "%",
        baseStat: "CRITRate"
    },
    "CriticalDamageBase": {
        name:"CRIT DMG",
        icon:"spriteoutput/ui/avatar/icon/IconCriticalDamage.png",
        unit: "%",
        baseStat: "CRITDmg"
    },
    "HealRatioBase": {
        name:"Outgoing Healing Boost",
        icon:"spriteoutput/ui/avatar/icon/IconHealRatio.png",
        unit: "%",
        baseStat: "HealBoost"
    },
    "StatusProbabilityBase": {
        name:"Effect Hit Rate",
        icon:"spriteoutput/ui/avatar/icon/IconStatusProbability.png",
        unit: "%",
        baseStat: "EffectHitRate"
    },
    "StatusResistanceBase": {
        name:"Effect RES",
        icon:"spriteoutput/ui/avatar/icon/IconStatusResistance.png",
        unit: "%",
        baseStat: "EffectRES"
    },
    "BreakDamageAddedRatioBase": {
        name:"Break Effect",
        icon:"spriteoutput/ui/avatar/icon/IconBreakUp.png",
        unit: "%",
        baseStat: "BreakEffect"
    },
    "SpeedDelta": {
        name:"SPD",
        icon:"spriteoutput/ui/avatar/icon/IconSpeed.png",
        unit: "",
        baseStat: "SPD"
    },
    "PhysicalAddedRatio": {
        name:"Physical DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconPhysicalAddedRatio.png",
        unit: "%",
        baseStat: "PhysicalAdd"
    },
    "FireAddedRatio": {
        name:"Fire DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconFireAddedRatio.png",
        unit: "%",
        baseStat: "FireAdd"
    },
    "IceAddedRatio": {
        name:"Ice DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconIceAddedRatio.png",
        unit: "%",
        baseStat: "IceAdd"
    },
    "ThunderAddedRatio": {
        name:"Thunder DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconThunderAddedRatio.png",
        unit: "%",
        baseStat: "ThunderAdd"
    },
    "WindAddedRatio": {
        name:"Wind DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconWindAddedRatio.png",
        unit: "%",
        baseStat: "WindAdd"
    },
    "QuantumAddedRatio": {
        name:"Quantum DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconQuantumAddedRatio.png",
        unit: "%",
        baseStat: "QuantumAdd"
    },
    "ImaginaryAddedRatio": {
        name:"Imaginary DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconImaginaryAddedRatio.png",
        unit: "%",
        baseStat: "ImaginaryAdd"
    },
    "ElationDamageAddedRatioBase": {
        name:"Elation DMG Boost",
        icon:"spriteoutput/ui/avatar/icon/IconJoy.png",
        unit: "%",
        baseStat: "ElationAdd"
    },
    "SPRatioBase": {
        name:"Energy Regeneration Rate",
        icon:"spriteoutput/ui/avatar/icon/IconEnergyRecovery.png",
        unit: "%",
        baseStat: "EnergyRate"
    }
}


export const ratioStats = [
    "HPAddedRatio",
    "AttackAddedRatio",
    "DefenceAddedRatio",
    "SpeedAddedRatio",
]

export const mappingRelicSlot: Record<string, string> = {
    "1": "HEAD",
    "2": "HAND",
    "3": "BODY",
    "4": "FOOT",
    "5": "NECK",
    "6": "OBJECT",
}

export const themeColors: Record<string, { bg: string; bgHover: string; text: string; border: string }> = {
  winter: {
    bg: '#ffffff',
    bgHover: '#f1f5f9',
    text: '#3a4f6b',
    border: '#cbd5e1'
  },
  night: {
    bg: '#1d232a',
    bgHover: '#2a323c',
    text: '#cbcdd1',
    border: '#3f3f46'
  },
  cupcake: {
    bg: '#faf7f5',
    bgHover: '#f3eae6',
    text: '#281333',
    border: '#e5d3cb'
  },
  coffee: {
    bg: '#20161f',
    bgHover: '#2a1d29',
    text: '#c4a051',
    border: '#3a2a36'
  }
}

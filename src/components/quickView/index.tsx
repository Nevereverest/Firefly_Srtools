"use client"
import NextImage from "next/image"
import useUserDataStore from "@/stores/userDataStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { calcAffixBonus, calcBaseStatRaw, calcBonusStatRaw, calcMainAffixBonus, calcMainAffixBonusRaw, calcPromotion, calcSubAffixBonusRaw, getLocaleName, replaceByParam } from "@/helper";
import { mappingStats } from "@/constant/constant";
import RelicShowcase from "../showcaseCard/relicShowcase";
import useLocaleStore from "@/stores/localeStore";
import useDetailDataStore from "@/stores/detailDataStore";
import useCurrentDataStore from "@/stores/currentDataStore";

export default function QuickView() {
    const { avatars } = useUserDataStore()
    const transI18n = useTranslations("DataPage")
    const { locale } = useLocaleStore()
    const { avatarSelected,  } = useCurrentDataStore()
    const { mainAffix, subAffix, mapRelicSet, mapLightCone, mapAvatar  } = useDetailDataStore()

 
    const avatarSkillTree = useMemo(() => {
        if (!avatarSelected || !avatars[avatarSelected?.ID?.toString()]) return {}
        if (avatars[avatarSelected?.ID?.toString()].enhanced) {
            return avatarSelected?.Enhanced?.[avatars[avatarSelected?.ID?.toString()].enhanced.toString()].SkillTrees || {}
        }
        return avatarSelected?.SkillTrees || {}
    }, [avatarSelected, avatars])

    const avatarData = useMemo(() => {
        if (!avatarSelected) return
        return avatars[avatarSelected?.ID?.toString()]
    }, [avatarSelected, avatars])

    const avatarProfile = useMemo(() => {
        if (!avatarSelected || !avatarData) return
        return avatarData?.profileList?.[avatarData?.profileSelect]
    }, [avatarSelected, avatarData])

    const relicEffects = useMemo(() => {
        const avatar = avatars[avatarSelected?.ID?.toString() || ""];
        const relicCount: { [key: string]: number } = {};
        if (avatar) {
            for (const relic of Object.values(avatar.profileList[avatar.profileSelect].relics)) {
                if (relicCount[relic.relic_set_id]) {
                    relicCount[relic.relic_set_id]++;
                } else {
                    relicCount[relic.relic_set_id] = 1;
                }
            }
        }
        const listEffects: { key: string, count: number }[] = [];
        Object.entries(relicCount).forEach(([key, value]) => {
            if (value >= 2) {
                listEffects.push({ key: key, count: value });
            }
        });
        return listEffects;
    }, [avatars, avatarSelected]);

    const relicStats = useMemo(() => {
        if (!avatarSelected || !avatarProfile?.relics || !mainAffix || !subAffix) return

        return Object.entries(avatarProfile?.relics).map(([key, value]) => {
            const mainAffixMap = mainAffix["5" + key]
            const subAffixMap = subAffix["5"]
            if (!mainAffixMap || !subAffixMap) return
            return {
                img: `${process.env.CDN_URL}/spriteoutput/relicfigures/IconRelic_${value.relic_set_id}_${key}.png`,
                mainAffix: {
                    property: mainAffixMap?.[value?.main_affix_id]?.Property,
                    level: value?.level,
                    valueAffix: calcMainAffixBonus(mainAffixMap?.[value?.main_affix_id], value?.level),
                    detail: mappingStats?.[mainAffixMap?.[value?.main_affix_id]?.Property]
                },
                subAffix: value?.sub_affixes?.map((subValue) => {
                    return {
                        property: subAffixMap?.[subValue?.sub_affix_id]?.Property,
                        valueAffix: calcAffixBonus(subAffixMap?.[subValue?.sub_affix_id], subValue?.step, subValue?.count),
                        detail: mappingStats?.[subAffixMap?.[subValue?.sub_affix_id]?.Property],
                        step: subValue?.step,
                        count: subValue?.count
                    }
                })
            }
        })
    }, [avatarSelected, avatarProfile, mainAffix, subAffix])

    const characterStats = useMemo(() => {
        if (!avatarSelected || !avatarData) return
        const charPromotion = calcPromotion(avatarData.level)

        const statsData: Record<string, {
            value: number,
            base: number,
            name: string,
            icon: string,
            unit: string,
            round: number
        }> = {
            HP: {
                value: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.HPBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.HPAdd,
                    avatarData.level
                ),
                base: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.HPBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.HPAdd,
                    avatarData.level
                ),
                name: "HP",
                icon: "spriteoutput/ui/avatar/icon/IconMaxHP.png",
                unit: "",
                round: 0
            },
            ATK: {
                value: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.AttackBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.AttackAdd,
                    avatarData.level
                ),
                base: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.AttackBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.AttackAdd,
                    avatarData.level
                ),
                name: "ATK",
                icon: "spriteoutput/ui/avatar/icon/IconAttack.png",
                unit: "",
                round: 0
            },
            DEF: {
                value: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.DefenceBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.DefenceAdd,
                    avatarData.level
                ),
                base: calcBaseStatRaw(
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.DefenceBase,
                    mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.DefenceAdd,
                    avatarData.level
                ),
                name: "DEF",
                icon: "spriteoutput/ui/avatar/icon/IconDefence.png",
                unit: "",
                round: 0
            },
            SPD: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.SpeedBase || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.SpeedBase || 0,
                name: "SPD",
                icon: "spriteoutput/ui/avatar/icon/IconSpeed.png",
                unit: "",
                round: 1
            },
            CRITRate: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalChance || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalChance || 0,
                name: "CRIT Rate",
                icon: "spriteoutput/ui/avatar/icon/IconCriticalChance.png",
                unit: "%",
                round: 1
            },
            CRITDmg: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalDamage || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalDamage || 0,
                name: "CRIT DMG",
                icon: "spriteoutput/ui/avatar/icon/IconCriticalDamage.png",
                unit: "%",
                round: 1
            },
            BreakEffect: {
                value: 0,
                base: 0,
                name: "Break Effect",
                icon: "spriteoutput/ui/avatar/icon/IconBreakUp.png",
                unit: "%",
                round: 1
            },
            EffectRES: {
                value: 0,
                base: 0,
                name: "Effect RES",
                icon: "spriteoutput/ui/avatar/icon/IconStatusResistance.png",
                unit: "%",
                round: 1
            },
            EnergyRate: {
                value: 0,
                base: 0,
                name: "Energy Rate",
                icon: "spriteoutput/ui/avatar/icon/IconEnergyRecovery.png",
                unit: "%",
                round: 1
            },
            EffectHitRate: {
                value: 0,
                base: 0,
                name: "Effect Hit Rate",
                icon: "spriteoutput/ui/avatar/icon/IconStatusProbability.png",
                unit: "%",
                round: 1
            },
            HealBoost: {
                value: 0,
                base: 0,
                name: "Healing Boost",
                icon: "spriteoutput/ui/avatar/icon/IconHealRatio.png",
                unit: "%",
                round: 1
            },
            PhysicalAdd: {
                value: 0,
                base: 0,
                name: "Physical Boost",
                icon: "spriteoutput/ui/avatar/icon/IconPhysicalAddedRatio.png",
                unit: "%",
                round: 1
            },
            FireAdd: {
                value: 0,
                base: 0,
                name: "Fire Boost",
                icon: "spriteoutput/ui/avatar/icon/IconFireAddedRatio.png",
                unit: "%",
                round: 1
            },
            IceAdd: {
                value: 0,
                base: 0,
                name: "Ice Boost",
                icon: "spriteoutput/ui/avatar/icon/IconIceAddedRatio.png",
                unit: "%",
                round: 1
            },
            ThunderAdd: {
                value: 0,
                base: 0,
                name: "Thunder Boost",
                icon: "spriteoutput/ui/avatar/icon/IconThunderAddedRatio.png",
                unit: "%",
                round: 1
            },
            WindAdd: {
                value: 0,
                base: 0,
                name: "Wind Boost",
                icon: "spriteoutput/ui/avatar/icon/IconWindAddedRatio.png",
                unit: "%",
                round: 1
            },
            QuantumAdd: {
                value: 0,
                base: 0,
                name: "Quantum Boost",
                icon: "spriteoutput/ui/avatar/icon/IconQuantumAddedRatio.png",
                unit: "%",
                round: 1
            },
            ImaginaryAdd: {
                value: 0,
                base: 0,
                name: "Imaginary Boost",
                icon: "spriteoutput/ui/avatar/icon/IconImaginaryAddedRatio.png",
                unit: "%",
                round: 1
            },
            ElationAdd: {
                value: 0,
                base: 0,
                name: "Elation Boost",
                icon: "spriteoutput/ui/avatar/icon/IconJoy.png",
                unit: "%",
                round: 1
            }
        }

        if (avatarProfile?.lightcone && mapLightCone[avatarProfile?.lightcone?.item_id]) {
            const lightconePromotion = calcPromotion(avatarProfile?.lightcone?.level)
            statsData.HP.value += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseHP,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHPAdd,
                avatarProfile?.lightcone?.level
            )
            statsData.HP.base += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseHP,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseHPAdd,
                avatarProfile?.lightcone?.level
            )
            statsData.ATK.value += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseAttack,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseAttackAdd,
                avatarProfile?.lightcone?.level
            )
            statsData.ATK.base += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseAttack,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseAttackAdd,
                avatarProfile?.lightcone?.level
            )
            statsData.DEF.value += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseDefence,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseDefenceAdd,
                avatarProfile?.lightcone?.level
            )
            statsData.DEF.base += calcBaseStatRaw(
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseDefence,
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats?.[lightconePromotion]?.BaseDefenceAdd,
                avatarProfile?.lightcone?.level
            )

            const bonusData = mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Skills?.Level?.[avatarProfile?.lightcone.rank]?.Bonus
            if (bonusData && bonusData.length > 0) {
                const bonusSpd = bonusData.filter((bonus) => bonus.PropertyType === "BaseSpeed")
                const bonusOther = bonusData.filter((bonus) => bonus.PropertyType !== "BaseSpeed")
                bonusSpd.forEach((bonus) => {
                    statsData.SPD.value += bonus.Value
                    statsData.SPD.base += bonus.Value
                })
                bonusOther.forEach((bonus) => {
                    const statsBase = mappingStats?.[bonus.PropertyType]?.baseStat
                    if (statsBase && statsData[statsBase]) {
                        statsData[statsBase].value += calcBonusStatRaw(bonus.PropertyType, statsData[statsBase].base, bonus.Value)
                    }
                })
            }
        }
        if (avatarSkillTree) {
            Object.values(avatarSkillTree).forEach((value) => {
                if (value?.["1"]
                    && value?.["1"]?.PointID
                    && typeof avatarData?.data?.skills?.[value?.["1"]?.PointID] === "number"
                    && avatarData?.data?.skills?.[value?.["1"]?.PointID] !== 0
                    && value?.["1"]?.StatusAddList
                    && value?.["1"].StatusAddList.length > 0) {
                    value?.["1"]?.StatusAddList.forEach((status) => {
                        const statsBase = mappingStats?.[status?.PropertyType]?.baseStat
                        if (statsBase && statsData[statsBase]) {
                            statsData[statsBase].value += calcBonusStatRaw(status?.PropertyType, statsData[statsBase].base, status.Value)
                        }
                    })
                }
            })
        }



        if (avatarProfile?.relics && mainAffix && subAffix) {
            Object.entries(avatarProfile?.relics).forEach(([key, value]) => {
                const mainAffixMap = mainAffix["5" + key]
                const subAffixMap = subAffix["5"]
                if (!mainAffixMap || !subAffixMap) return
                const mainStats = mappingStats?.[mainAffixMap?.[value.main_affix_id]?.Property]?.baseStat
                if (mainStats && statsData[mainStats]) {
                    statsData[mainStats].value += calcMainAffixBonusRaw(mainAffixMap?.[value.main_affix_id], value.level, statsData[mainStats].base)
                }
                value?.sub_affixes.forEach((subValue) => {
                    const subStats = mappingStats?.[subAffixMap?.[subValue.sub_affix_id]?.Property]?.baseStat
                    if (subStats && statsData[subStats]) {
                        statsData[subStats].value += calcSubAffixBonusRaw(subAffixMap?.[subValue.sub_affix_id], subValue.step, subValue.count, statsData[subStats].base)
                    }
                })
            })
        }

        if (relicEffects && relicEffects.length > 0) {
            relicEffects.forEach((relic) => {
                const dataBonus = mapRelicSet?.[relic.key]?.Skills
                if (!dataBonus || Object.keys(dataBonus).length === 0) return
                Object.entries(dataBonus || {}).forEach(([key, value]) => {
                    if (relic.count < Number(key)) return
                    value.Bonus.forEach((bonus) => {
                        const statsBase = mappingStats?.[bonus.PropertyType]?.baseStat
                        if (statsBase && statsData[statsBase]) {
                            statsData[statsBase].value += calcBonusStatRaw(bonus.PropertyType, statsData[statsBase].base, bonus.Value)
                        }
                    })
                })
            })
        }


        return statsData
    }, [
        avatarSelected,
        avatarData,
        mapAvatar,
        avatarProfile?.lightcone,
        avatarProfile?.relics,
        mapLightCone,
        mainAffix,
        subAffix,
        relicEffects,
        mapRelicSet,
        avatarSkillTree
    ])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 flex flex-col justify-between py-3">
                <div className="flex w-full flex-col justify-between gap-y-0.5 text-base">
                    {Object.entries(characterStats || {})?.map(([key, stat], index) => {
                        if (!stat || (key.includes("Add") && stat.value === 0)) return null
                        return (
                            <div key={index} className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center">
                                    <NextImage 
                                        src={`${process.env.CDN_URL}/${stat?.icon}`} 
                                        unoptimized
                                        crossOrigin="anonymous"
                                        alt="Stat Icon" 
                                        width={40} 
                                        height={40} 
                                        className="h-10 w-10 p-1 mx-1 bg-black/20 rounded-full" 
                                    />
                                    <div className="font-bold">{stat.name}</div>
                                </div>
                                <div className="ml-3 mr-3 grow border rounded opacity-50" />
                                <div className="flex cursor-default flex-col text-right font-bold">{
                                    stat.value ? stat.unit === "%" ? (stat.value * 100).toFixed(stat.round) : stat.value.toFixed(stat.round) : 0
                                }{stat.unit}</div>
                            </div>
                        )
                    })}
                    <hr />
                </div>

                <div className="flex flex-col items-center gap-1 w-full my-2">
                    {relicEffects.map((setEffect, index) => {
                        const relicInfo = mapRelicSet[setEffect.key];
                        if (!relicInfo) return null;
                        return (
                            <div key={index} className="flex w-full flex-row justify-between text-left">
                                <div
                                    className="font-bold truncate max-w-full mr-1"
                                    style={{
                                        fontSize: 'clamp(0.5rem, 2vw, 1rem)'
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: replaceByParam(
                                            getLocaleName(locale, relicInfo.Name),
                                            []
                                        )
                                    }}
                                />
                                <div>
                                    <span className="black-blur bg-black/20 flex w-5 justify-center rounded px-1.5 py-0.5">{setEffect.count}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 justify-between py-3 text-lg">

                {relicStats?.map((relic, index) => {
                    if (!relic || !avatarSelected) return null
                    return (
                        <RelicShowcase key={index} relic={relic} avatarInfo={avatarSelected} />
                    )
                })}

                {(!relicStats || !relicStats?.length) && (
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-center p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
                            <span className="text-lg text-gray-400">{transI18n("noRelicEquipped")}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
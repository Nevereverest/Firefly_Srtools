"use client"
import NextImage from "next/image"
import useUserDataStore from "@/stores/userDataStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { calcAffixBonus, calcBaseStatRaw, calcBonusStatRaw, calcMainAffixBonus, calcMainAffixBonusRaw, calcPromotion, calcSubAffixBonusRaw, getLocaleName, replaceByParam } from "@/helper";
import { mappingStats } from "@/constant/constant";
import QuickViewRelic from "./quickViewRelic";
import useLocaleStore from "@/stores/localeStore";
import useDetailDataStore from "@/stores/detailDataStore";
import useCurrentDataStore from "@/stores/currentDataStore";
import { useShallow } from "zustand/react/shallow";

export default function QuickView() {
    const { avatars } = useUserDataStore(
        useShallow((state) => ({ avatars: state.avatars }))
    )
    const transI18n = useTranslations("DataPage")
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    )
    const { avatarSelected } = useCurrentDataStore(
        useShallow((state) => ({ avatarSelected: state.avatarSelected }))
    )
    const { mainAffix, subAffix, mapRelicSet, mapLightCone, mapAvatar } = useDetailDataStore(
        useShallow((state) => ({
            mainAffix: state.mainAffix,
            subAffix: state.subAffix,
            mapRelicSet: state.mapRelicSet,
            mapLightCone: state.mapLightCone,
            mapAvatar: state.mapAvatar,
        }))
    )

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
        return avatarData?.profileList?.[avatarData?.profileSelect] ?? avatarData?.profileList?.[0]
    }, [avatarSelected, avatarData])

    const relicEffects = useMemo(() => {
        const avatar = avatars[avatarSelected?.ID?.toString() || ""];
        const relicCount: { [key: string]: number } = {};
        const profile = avatar?.profileList?.[avatar?.profileSelect] ?? avatar?.profileList?.[0];
        if (profile?.relics) {
            for (const relic of Object.values(profile.relics)) {
                if (relic && relic.relic_set_id) {
                    relicCount[relic.relic_set_id] = (relicCount[relic.relic_set_id] || 0) + 1;
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
                img: `${process.env.CDN_URL}/spriteoutput/relicfigures/iconrelic_${value.relic_set_id}_${key}.webp`,
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
                name: transI18n("hp"),
                icon: "spriteoutput/ui/avatar/icon/iconmaxhp.webp",
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
                name: transI18n("atk"),
                icon: "spriteoutput/ui/avatar/icon/iconattack.webp",
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
                name: transI18n("def"),
                icon: "spriteoutput/ui/avatar/icon/icondefence.webp",
                unit: "",
                round: 0
            },
            SPD: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.SpeedBase || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.SpeedBase || 0,
                name: transI18n("speed"),
                icon: "spriteoutput/ui/avatar/icon/iconspeed.webp",
                unit: "",
                round: 1
            },
            CRITRate: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalChance || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalChance || 0,
                name: transI18n("critRate"),
                icon: "spriteoutput/ui/avatar/icon/iconcriticalchance.webp",
                unit: "%",
                round: 1
            },
            CRITDmg: {
                value: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalDamage || 0,
                base: mapAvatar?.[avatarSelected?.ID?.toString()]?.Stats[charPromotion]?.CriticalDamage || 0,
                name: transI18n("critDmg"),
                icon: "spriteoutput/ui/avatar/icon/iconcriticaldamage.webp",
                unit: "%",
                round: 1
            },
            BreakEffect: {
                value: 0,
                base: 0,
                name: transI18n("breakEffect"),
                icon: "spriteoutput/ui/avatar/icon/iconbreakup.webp",
                unit: "%",
                round: 1
            },
            EffectRES: {
                value: 0,
                base: 0,
                name: transI18n("effectRes"),
                icon: "spriteoutput/ui/avatar/icon/iconstatusresistance.webp",
                unit: "%",
                round: 1
            },
            EnergyRate: {
                value: 0,
                base: 0,
                name: transI18n("energyRegenerationRate"),
                icon: "spriteoutput/ui/avatar/icon/iconenergyrecovery.webp",
                unit: "%",
                round: 1
            },
            EffectHitRate: {
                value: 0,
                base: 0,
                name: transI18n("effectHitRate"),
                icon: "spriteoutput/ui/avatar/icon/iconstatusprobability.webp",
                unit: "%",
                round: 1
            },
            HealBoost: {
                value: 0,
                base: 0,
                name: transI18n("outgoingHealingBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconhealratio.webp",
                unit: "%",
                round: 1
            },
            PhysicalAdd: {
                value: 0,
                base: 0,
                name: transI18n("physicalDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconphysicaladdedratio.webp",
                unit: "%",
                round: 1
            },
            FireAdd: {
                value: 0,
                base: 0,
                name: transI18n("fireDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconfireaddedratio.webp",
                unit: "%",
                round: 1
            },
            IceAdd: {
                value: 0,
                base: 0,
                name: transI18n("iceDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconiceaddedratio.webp",
                unit: "%",
                round: 1
            },
            ThunderAdd: {
                value: 0,
                base: 0,
                name: transI18n("thunderDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconthunderaddedratio.webp",
                unit: "%",
                round: 1
            },
            WindAdd: {
                value: 0,
                base: 0,
                name: transI18n("windDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconwindaddedratio.webp",
                unit: "%",
                round: 1
            },
            QuantumAdd: {
                value: 0,
                base: 0,
                name: transI18n("quantumDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconquantumaddedratio.webp",
                unit: "%",
                round: 1
            },
            ImaginaryAdd: {
                value: 0,
                base: 0,
                name: transI18n("imaginaryDmgBoost"),
                icon: "spriteoutput/ui/avatar/icon/iconimaginaryaddedratio.webp",
                unit: "%",
                round: 1
            },
            ElationAdd: {
                value: 0,
                base: 0,
                name: transI18n("elation"),
                icon: "spriteoutput/ui/avatar/icon/iconjoy.webp",
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
                mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHPAdd,
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
        avatarSkillTree,
        transI18n
    ])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-1">
            {/* Stats Overview Column - Clean Minimal Grid, No Box-in-Box */}
            <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-primary rounded-full" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/90">
                                {transI18n("character")}
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-medium text-base-content/60">
                            {transI18n("level")} {avatarData?.level || 1}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        {Object.entries(characterStats || {})?.map(([key, stat], index) => {
                            if (!stat || (key.includes("Add") && stat.value === 0)) return null
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-1.5 border-b border-base-content/5"
                                >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <NextImage
                                            src={`${process.env.CDN_URL}/${stat?.icon}`}
                                            unoptimized
                                            alt={stat.name}
                                            width={20}
                                            height={20}
                                            className="h-5 w-5 theme-stat-icon shrink-0 object-contain"
                                        />
                                        <span className="font-medium text-base-content/80 truncate">{stat.name}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-primary shrink-0 text-right">
                                        {stat.value ? stat.unit === "%" ? (stat.value * 100).toFixed(stat.round) : stat.value.toFixed(stat.round) : 0}
                                        <span className="text-[10px] font-normal opacity-80 ml-0.5">{stat.unit}</span>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Set Effects - Flat Minimalist Row */}
                {relicEffects.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-base-content/10">
                            <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/90">
                                {transI18n("relics")}
                            </h4>
                        </div>
                        <div className="space-y-1">
                            {relicEffects.map((setEffect, index) => {
                                const relicInfo = mapRelicSet[setEffect.key];
                                if (!relicInfo) return null;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-xs py-1.5 border-b border-base-content/5"
                                    >
                                        <div
                                            className="font-medium text-base-content/90 truncate max-w-[80%]"
                                            dangerouslySetInnerHTML={{
                                                __html: replaceByParam(getLocaleName(locale, relicInfo.Name), [])
                                            }}
                                        />
                                        <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 text-xs shrink-0">
                                            {setEffect.count} Pc
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Relic Equipment Cards Column */}
            <div className="lg:col-span-6 space-y-2">
                {relicStats?.map((relic, index) => {
                    if (!relic || !avatarSelected) return null
                    return (
                        <QuickViewRelic key={index} relic={relic} avatarInfo={avatarSelected} />
                    )
                })}

                {(!relicStats || !relicStats?.length) && (
                    <div className="p-8 text-center text-base-content/40 text-xs italic">
                        {transI18n("noRelicEquipped")}
                    </div>
                )}
            </div>
        </div>
    )
}
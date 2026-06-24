"use client"
import { useEffect, useMemo } from "react";
import SelectCustomText from "../select/customSelectText";
import { calcMonsterStats, getLocaleName, replaceByParam } from "@/helper";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import Image from "next/image";
import { ASEvent, MonsterStore } from "@/types";
import { useTranslations } from "next-intl";
import useDetailDataStore from "@/stores/detailDataStore";

export default function AsBar() {
    const { locale } = useLocaleStore()
    const {
        as_config,
        setAsConfig
    } = useUserDataStore()
    const { mapMonster, mapAS, damageType, hardLevelConfig, eliteConfig } = useDetailDataStore()
    const transI18n = useTranslations("DataPage")

    const challengeSelected = useMemo(() => {
        return mapAS[as_config.event_id.toString()]?.Level.find((as) => as.ID === as_config.challenge_id)
    }, [as_config, mapAS])

    const eventSelected = useMemo(() => {
        return mapAS[as_config.event_id.toString()]
    }, [as_config, mapAS])


    const floorSideList = useMemo(() => {
        if (!eventSelected) return [];

        const floorList = [
            {
                id: "firstNode",
                name: transI18n("firstNode"),
                wave: transI18n("firstNodeEnemies")
            },
            {
                id: "secondNode",
                name: transI18n("secondNode"),
                wave: transI18n("secondNodeEnemies")
            },

        ]

        if (eventSelected?.Tierce && eventSelected.Tierce.PreChallenge === as_config.challenge_id) {
            floorList.push({
                id: "thirdNode",
                name: transI18n("thirdNode"),
                wave: transI18n("thirdNodeEnemies")
            })
        }
        return floorList
    }, [as_config.challenge_id, eventSelected, transI18n])

    const buffList = useMemo(() => {
        if (!eventSelected) return [];

        if (as_config.floor_side === "firstNode") {
            return eventSelected?.BuffList1 ?? [];
        }

        if (as_config.floor_side === "secondNode") {
            return eventSelected?.BuffList2 ?? [];
        }

        if (as_config.floor_side === "thirdNode" && eventSelected?.BuffList3) {
            return eventSelected?.BuffList3 ?? [];
        }

        return [];
    }, [as_config.floor_side, eventSelected]);

    useEffect(() => {
        if (!challengeSelected || as_config.event_id === 0 || as_config.challenge_id === 0) return
        const newBattleConfig = structuredClone(as_config)
        newBattleConfig.cycle_count = challengeSelected.TurnLimit

        newBattleConfig.blessings = []
        if (as_config.buff_id !== 0) {
            newBattleConfig.blessings.push({
                id: as_config.buff_id,
                level: 1
            })
        }

        if (challengeSelected) {
            challengeSelected.MazeBuff.map((item) => {
                newBattleConfig.blessings.push({
                    id: item.ID,
                    level: 1
                })
            })
        }

        newBattleConfig.monsters = []
        newBattleConfig.stage_id = 0

        let targetEventList: ASEvent[] = []
        if (as_config.floor_side === "firstNode" && challengeSelected.EventList1.length > 0) {
            targetEventList = challengeSelected.EventList1
        } else if (as_config.floor_side === "secondNode" && challengeSelected.EventList2.length > 0) {
            targetEventList = challengeSelected.EventList2
        } else if (as_config.floor_side === "thirdNode" && eventSelected?.Tierce && eventSelected.Tierce.EventList.length > 0) {
            targetEventList = eventSelected.Tierce.EventList
        }

        if (targetEventList.length > 0) {
            newBattleConfig.stage_id = targetEventList[0].ID
            for (const wave of targetEventList[0].MonsterList) {
                const newWave: MonsterStore[] = []
                for (const value of Object.values(wave)) {
                    newWave.push({
                        monster_id: value,
                        level: targetEventList[0].Level,
                        amount: 1,
                    })
                }
                newBattleConfig.monsters.push(newWave)
            }
        }

        setAsConfig(newBattleConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        challengeSelected,
        eventSelected,
        mapAS,
        as_config.event_id,
        as_config.challenge_id,
        as_config.floor_side,
        as_config.buff_id,
    ])

    if (!mapAS) return null
    return (
        <div className="py-8 relative">

            {/* Title Card */}
            <div className="rounded-xl p-4 mb-2 border border-warning">
                <div className="mb-4 w-full">
                    <SelectCustomText
                        customSet={Object.values(mapAS).sort((a, b) => b.ID - a.ID).map((as) => ({
                            id: as.ID.toString(),
                            name: getLocaleName(locale, as.Name),
                            time: `${as.BeginTime} - ${as.EndTime}`,
                        }))}
                        excludeSet={[]}
                        selectedCustomSet={as_config.event_id.toString()}
                        placeholder={transI18n("selectASEvent")}
                        setSelectedCustomSet={(id) => setAsConfig({
                            ...as_config,
                            event_id: Number(id),
                            challenge_id: mapAS[Number(id)]?.Level.at(-1)?.ID || 0,
                            buff_id: 0
                        })}
                    />
                </div>
                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">

                    <div className="flex items-center gap-2">
                        <label className="label">
                            <span className="label-text font-bold text-success">{transI18n("floor")}:{" "}</span>
                        </label>
                        <select
                            value={as_config.challenge_id}
                            className="select select-success"
                            onChange={(e) => setAsConfig({ ...as_config, challenge_id: Number(e.target.value) })}
                        >
                            <option value={0} disabled={true}>{transI18n("selectFloor")}</option>
                            {eventSelected?.Level.map((as) => (
                                <option key={as.ID} value={as.ID}>{getLocaleName(locale, as.Name)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="label">
                            <span className="label-text font-bold text-success">{transI18n("side")}:{" "}</span>
                        </label>
                        <select
                            value={as_config.floor_side}
                            className="select select-success"
                            onChange={(e) => setAsConfig({ ...as_config, floor_side: e.target.value })}
                        >
                            <option value={0} disabled={true}>{transI18n("selectSide")}</option>
                            {floorSideList.map((side) => {
                                return <option key={side.id} value={side.id}>{side.name}</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className="label-text font-bold text-success mb-2">StageId: {as_config?.stage_id}</div>
                {eventSelected && (
                    <div className="mb-4 w-full">
                        <SelectCustomText
                            customSet={buffList.map((buff) => ({
                                id: buff.ID?.toString() || "",
                                name: getLocaleName(locale, buff?.Name) || "",
                                description: replaceByParam(getLocaleName(locale, buff?.Desc) || "", buff?.Param || []),
                            }))}
                            excludeSet={[]}
                            selectedCustomSet={as_config?.buff_id?.toString()}
                            placeholder={transI18n("selectBuff")}
                            setSelectedCustomSet={(id) => setAsConfig({ ...as_config, buff_id: Number(id) })}
                        />
                    </div>
                )}
                {/* Turbulence Buff */}
                <div className="bg-base-200/20 rounded-lg p-4 border border-purple-500/20">
                    <h2 className="text-2xl font-bold mb-2 text-info">{transI18n("turbulenceBuff")}</h2>
                    {challengeSelected ? (
                        challengeSelected.MazeBuff.map((buff, i) => (
                            <div
                                key={i}
                                className="text-base"
                                dangerouslySetInnerHTML={{
                                    __html: replaceByParam(
                                        getLocaleName(locale, buff?.Desc) || "",
                                        buff?.Param || []
                                    )
                                }}
                            />
                        ))
                    ) : (
                        <div className="text-base">{transI18n("noTurbulenceBuff")}</div>
                    )}
                </div>
            </div>

            {/* Enemy Waves */}
            {(as_config?.challenge_id ?? 0) !== 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {floorSideList.map((side, i) => {
                        const eventList = side.id === "firstNode"
                            ? challengeSelected?.EventList1
                            : side.id === "secondNode"
                                ? challengeSelected?.EventList2
                                : side.id === "thirdNode"
                                    ? eventSelected?.Tierce?.EventList
                                    : [];

                        if (!eventList || eventList.length === 0) return null;
                        const targetEvent = eventList[0];

                        return (
                            <div key={i} className="rounded-xl p-4 mt-2 border border-warning">
                                <h2 className="text-2xl font-bold mb-6 text-info">{side.wave}</h2>

                                {targetEvent?.MonsterList?.map((wave, waveIndex) => (
                                    <div key={waveIndex} className="mb-6">
                                        <h3 className="text-lg font-semibold">{transI18n("wave")} {waveIndex + 1}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Object.values(wave).map((waveValue, enemyIndex) => {
                                                const monsterStats = calcMonsterStats(
                                                    mapMonster?.[waveValue.toString()],
                                                    targetEvent?.EliteGroup,
                                                    targetEvent?.HardLevelGroup,
                                                    targetEvent?.Level,
                                                    hardLevelConfig,
                                                    eliteConfig
                                                );
                                            return (
                                                <div
                                                    key={enemyIndex}
                                                    className="group relative flex flex-col w-40 bg-base-100 rounded-2xl border border-base-300 shadow-md"
                                                >
                                                    <div className="badge badge-warning badge-sm font-bold absolute top-2 right-2 z-10 shadow-sm">
                                                        Lv. {targetEvent.Level}
                                                    </div>

                                                    <div className="relative w-full h-20 bg-base-200 flex items-center justify-center p-4 rounded-t-2xl">
                                                        {mapMonster?.[waveValue.toString()]?.Image?.IconPath && (
                                                            <div className="relative w-16 h-16 rounded-full border-2 border-base-300 shadow-md overflow-hidden group-hover:scale-110 transition-transform duration-300 bg-base-100">
                                                                <Image
                                                                    unoptimized
                                                                    crossOrigin="anonymous"
                                                                    src={`${process.env.CDN_URL}/${mapMonster?.[waveValue.toString()]?.Image?.IconPath}`}
                                                                    alt="Enemy Icon"
                                                                    width={150}
                                                                    height={150}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col px-1 pb-2 pt-2">
                                                        <div className="flex flex-col space-y-1.5">
                                                            <div className="flex justify-between items-center bg-base-200 px-2.5 py-1.5 rounded-lg">
                                                                <span className="text-xs font-semibold text-error">HP</span>
                                                                <span className="text-sm font-bold text-base-content">{monsterStats.hp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            </div>

                                                            <div className="flex justify-between items-center bg-base-200 px-2.5 py-1.5 rounded-lg">
                                                                <span className="text-xs font-semibold text-info">Speed</span>
                                                                <span className="text-sm font-bold text-base-content">{monsterStats.spd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            </div>

                                                            <div className="flex justify-between items-center bg-base-200 px-2.5 py-1.5 rounded-lg">
                                                                <span className="text-xs font-semibold text-base-content/70">Toughness</span>
                                                                <span className="text-sm font-bold text-base-content">{monsterStats.stance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 pt-2 border-t border-base-300 flex flex-col items-center">
                                                            <span className="text-[10px] text-base-content/60 font-bold uppercase tracking-widest mb-1.5">
                                                                Weakness
                                                            </span>
                                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                                {mapMonster?.[waveValue.toString()]?.StanceWeakList?.map((icon, iconIndex) => (
                                                                    <Image
                                                                        key={iconIndex}
                                                                        unoptimized
                                                                        crossOrigin="anonymous"
                                                                        src={`${process.env.CDN_URL}/${damageType[icon]?.Icon}`}
                                                                        alt={icon}
                                                                        width={40}
                                                                        height={40}
                                                                        className="h-6 w-6 object-contain rounded-full bg-base-300 border border-base-content/10 p-0.5 shadow-sm hover:scale-110 transition-transform"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )})}
                </div>
            )}

        </div>
    )
}
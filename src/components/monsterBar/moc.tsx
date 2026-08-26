"use client"

import { useEffect, useMemo } from "react";
import SelectCustomText from "../select/customSelectText";
import { calcMonsterStats, getLocaleName, replaceByParam } from "@/helper";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MoCEvent, MonsterStore } from "@/types";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";

export default function MocBar() {
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    )
    const {
        moc_config,
        setMocConfig
    } = useUserDataStore(
        useShallow((state) => ({
            moc_config: state.moc_config,
            setMocConfig: state.setMocConfig,
        }))
    )
    const { mapMonster, mapMoc, damageType, hardLevelConfig, eliteConfig } = useDetailDataStore(
        useShallow((state) => ({
            mapMonster: state.mapMonster,
            mapMoc: state.mapMoc,
            damageType: state.damageType,
            hardLevelConfig: state.hardLevelConfig,
            eliteConfig: state.eliteConfig,
        }))
    )

    const transI18n = useTranslations("DataPage")

    const challengeSelected = useMemo(() => {
        return mapMoc[moc_config.event_id.toString()]?.Level.find((moc) => moc.ID === moc_config.challenge_id)
    }, [moc_config, mapMoc])

    const eventSelected = useMemo(() => {
        return mapMoc[moc_config.event_id.toString()]
    }, [moc_config, mapMoc])

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

        if (eventSelected?.Tierce && eventSelected.Tierce.PreChallenge === moc_config.challenge_id) {
            floorList.push({
                id: "thirdNode",
                name: transI18n("thirdNode"),
                wave: transI18n("thirdNodeEnemies")
            })
        }
        return floorList
    }, [moc_config.challenge_id, eventSelected, transI18n])

    useEffect(() => {
        if (!challengeSelected || moc_config.event_id === 0 || moc_config.challenge_id === 0) return

        const newBattleConfig = structuredClone(moc_config)
        newBattleConfig.cycle_count = 0
        if (moc_config.use_cycle_count) {
            newBattleConfig.cycle_count = challengeSelected.TurnLimit
        }
        newBattleConfig.blessings = []
        if (moc_config.use_turbulence_buff && challengeSelected) {
            challengeSelected.MazeBuff.map((item) => {
                newBattleConfig.blessings.push({
                    id: item.ID,
                    level: 1
                })
            })
        }
        newBattleConfig.monsters = []
        newBattleConfig.stage_id = 0

        let targetEventList: MoCEvent[] = []
        if (moc_config.floor_side === "firstNode" && challengeSelected.EventList1.length > 0) {
            targetEventList = challengeSelected.EventList1
        } else if (moc_config.floor_side === "secondNode" && challengeSelected.EventList2.length > 0) {
            targetEventList = challengeSelected.EventList2
        } else if (moc_config.floor_side === "thirdNode" && eventSelected?.Tierce && eventSelected.Tierce.EventList.length > 0) {
            targetEventList = eventSelected.Tierce.EventList
        }

        if (targetEventList.length > 0) {
            newBattleConfig.stage_id = targetEventList[0].ID
            
            if (targetEventList[0].Invasion) {
                newBattleConfig.blessings.push({
                    id: targetEventList[0].Invasion.MazeBuff.ID,
                    level: 1
                })
            }

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

        setMocConfig(newBattleConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        challengeSelected,
        eventSelected,
        moc_config.event_id,
        moc_config.challenge_id,
        moc_config.floor_side,
        moc_config.use_cycle_count,
        moc_config.use_turbulence_buff,
        mapMoc,
    ])

    if (!mapMoc) return null

    return (
        <div className="pt-4 pb-2 relative space-y-4">

            {/* Title Card */}
            <div className="rounded-xl p-4 border border-warning">
                <div className="mb-4 w-full">
                    <SelectCustomText
                        customSet={Object.values(mapMoc).sort((a, b) => b.ID - a.ID).map((moc) => ({
                            id: moc.ID.toString(),
                            name: getLocaleName(locale, moc.Name),
                            time: `${moc.BeginTime} - ${moc.EndTime}`,
                        }))}
                        excludeSet={[]}
                        selectedCustomSet={moc_config.event_id.toString()}
                        placeholder={transI18n("selectMOCEvent")}
                        setSelectedCustomSet={(id) => setMocConfig({
                            ...moc_config,
                            event_id: Number(id),
                            challenge_id: mapMoc[Number(id)]?.Level.at(-1)?.ID || 0,
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
                            value={moc_config.challenge_id}
                            className="select select-success"
                            onChange={(e) => setMocConfig({
                                ...moc_config,
                                challenge_id: Number(e.target.value)
                            })}
                        >
                            <option value={0} disabled={true}>Select a Floor</option>
                            {eventSelected?.Level?.map((moc) => (
                                <option key={moc.ID} value={moc.ID}>{getLocaleName(locale, moc.Name)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="label">
                            <span className="label-text font-bold text-success">{transI18n("side")}:{" "}</span>
                        </label>
                        <select
                            value={moc_config.floor_side}
                            className="select select-success"
                            onChange={(e) => setMocConfig({ ...moc_config, floor_side: e.target.value })}
                        >
                            <option value={0} disabled={true}>{transI18n("selectSide")}</option>
                            {floorSideList.map((side) => (
                                <option key={side.id} value={side.id}>{side.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    

                    <div className="flex items-center gap-2">
                        <label className="label cursor-pointer">
                            <span
                                onClick={() => setMocConfig({ ...moc_config, use_cycle_count: !moc_config.use_cycle_count })}
                                className="label-text font-bold text-success cursor-pointer"
                            >
                                {transI18n("useCycleCount")} {" "}
                            </span>
                            <input
                                type="checkbox"
                                checked={moc_config.use_cycle_count}
                                onChange={(e) => setMocConfig({ ...moc_config, use_cycle_count: e.target.checked })}
                                className="checkbox checkbox-primary"
                            />
                        </label>
                    </div>
                </div>
                <div className="label-text font-bold text-success mb-2">StageId: {moc_config?.stage_id}</div>

                {/* Turbulence Buff */}
                <div className="pt-3 border-t border-base-content/10 space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={moc_config.use_turbulence_buff}
                            onChange={(e) => setMocConfig({ ...moc_config, use_turbulence_buff: e.target.checked })}
                            className="checkbox checkbox-primary"
                        />
                        <span
                            onClick={() => setMocConfig({ ...moc_config, use_turbulence_buff: !moc_config.use_turbulence_buff })}
                            className="font-bold text-success cursor-pointer">
                            {transI18n("useTurbulenceBuff")}
                        </span>
                    </div>
                    {challengeSelected ? (
                        challengeSelected.MazeBuff.map((buff, i) => (
                            <div
                                key={i}
                                className="text-sm text-base-content/85 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: replaceByParam(
                                        getLocaleName(locale, buff?.Desc) || "",
                                        buff?.Param || []
                                    )
                                }}
                            />
                        ))
                    ) : (
                        <div className="text-sm text-base-content/50 italic">{transI18n("noTurbulenceBuff")}</div>
                    )}
                </div>
            </div>

            {/* Enemy Waves */}
            {(moc_config?.challenge_id ?? 0) !== 0 && (
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
                            <div key={i} className="rounded-xl p-4 border border-warning">
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

                                                            <div className="mt-2 pt-2 border-t border-base-300 flex flex-col items-center">
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
                        )
                    })}
                </div>
            )}

        </div>
    )
}
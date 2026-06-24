"use client"
import { useEffect, useMemo } from "react";
import SelectCustomText from "../select/customSelectText";
import { calcMonsterStats, getLocaleName, replaceByParam } from "@/helper";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import Image from "next/image";
import { MonsterStore, PFEvent } from "@/types";
import { useTranslations } from "next-intl";
import useDetailDataStore from "@/stores/detailDataStore";

export default function PfBar() {
    const { locale } = useLocaleStore()
    const {
        pf_config,
        setPfConfig
    } = useUserDataStore()
    const { mapMonster, mapPF, damageType, hardLevelConfig, eliteConfig } = useDetailDataStore()

    const transI18n = useTranslations("DataPage")
    const challengeSelected = useMemo(() => {
        return mapPF[pf_config.event_id.toString()]?.Level.find((pf) => pf.ID === pf_config.challenge_id)
    }, [pf_config, mapPF])

    const eventSelected = useMemo(() => {
        return mapPF[pf_config.event_id.toString()]
    }, [pf_config, mapPF])

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

        if (eventSelected?.Tierce && eventSelected.Tierce.PreChallenge === pf_config.challenge_id) {
            floorList.push({
                id: "thirdNode",
                name: transI18n("thirdNode"),
                wave: transI18n("thirdNodeEnemies")
            })
        }
        return floorList
    }, [pf_config.challenge_id, eventSelected, transI18n])


    useEffect(() => {
        if (!challengeSelected || pf_config.event_id === 0 || pf_config.challenge_id === 0) {
            return
        }
        const newBattleConfig = structuredClone(pf_config)
        newBattleConfig.cycle_count = challengeSelected.TurnLimit
        newBattleConfig.blessings = []
        if (pf_config.buff_id !== 0) {
            newBattleConfig.blessings.push({
                id: pf_config.buff_id,
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

        let targetEventList: PFEvent[] = []
        if (pf_config.floor_side === "firstNode" && challengeSelected.EventList1.length > 0) {
            targetEventList = challengeSelected.EventList1
        } else if (pf_config.floor_side === "secondNode" && challengeSelected.EventList2.length > 0) {
            targetEventList = challengeSelected.EventList2
        } else if (pf_config.floor_side === "thirdNode" && eventSelected?.Tierce && eventSelected.Tierce.EventList.length > 0) {
            targetEventList = eventSelected.Tierce.EventList
        }

        if (targetEventList.length > 0) {
            newBattleConfig.stage_id = targetEventList[0].ID
            for (const wave of targetEventList[0].MonsterList) {
                const newWave: MonsterStore[] = []
                for (const value of Object.values(wave)) {
                    newWave.push({
                        monster_id: value as number,
                        level: targetEventList[0].Level,
                        amount: 1,
                    })
                }
                newBattleConfig.monsters.push(newWave)
            }
        }

        setPfConfig(newBattleConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        challengeSelected,
        eventSelected,
        pf_config.event_id,
        pf_config.challenge_id,
        pf_config.floor_side,
        pf_config.buff_id,
        mapPF,
    ])
    if (!mapPF) return null

    return (
        <div className="py-8 relative">

            {/* Title Card */}
            <div className="rounded-xl p-4 mb-2 border border-warning">
                <div className="mb-4 w-full">
                    <SelectCustomText
                        customSet={Object.values(mapPF).sort((a, b) => b.ID - a.ID).map((pf) => ({
                            id: pf.ID.toString(),
                            name: getLocaleName(locale, pf.Name),
                            time: `${pf.BeginTime} - ${pf.EndTime}`,
                        }))}
                        excludeSet={[]}
                        selectedCustomSet={pf_config.event_id.toString()}
                        placeholder={transI18n("selectPFEvent")}
                        setSelectedCustomSet={(id) => setPfConfig({
                            ...pf_config,
                            event_id: Number(id),
                            challenge_id: mapPF[Number(id)]?.Level.slice(-1)[0]?.ID || 0,
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
                            value={pf_config.challenge_id}
                            className="select select-success"
                            onChange={(e) => setPfConfig({ ...pf_config, challenge_id: Number(e.target.value) })}
                        >
                            <option value={0} disabled={true}>{transI18n("selectFloor")}</option>
                            {eventSelected?.Level.map((pf) => (
                                <option key={pf.ID} value={pf.ID}>{getLocaleName(locale, pf.Name)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="label">
                            <span className="label-text font-bold text-success">{transI18n("side")}:{" "}</span>
                        </label>
                        <select
                            value={pf_config.floor_side}
                            className="select select-success"
                            onChange={(e) => setPfConfig({ ...pf_config, floor_side: e.target.value })}
                        >
                            <option value={0} disabled={true}>{transI18n("selectSide")}</option>
                            {floorSideList.map((side) => (
                                <option key={side.id} value={side.id}>{side.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="label-text font-bold text-success mb-2">StageId: {pf_config?.stage_id}</div>
                {eventSelected && (
                    <div className="mb-4 w-full">
                        <SelectCustomText
                            customSet={eventSelected.Option.map((buff) => ({
                                id: buff.ID?.toString() || "",
                                name: getLocaleName(locale, buff?.Name) || "",
                                description: replaceByParam(getLocaleName(locale, buff?.Desc) || "", buff?.Param || []),
                            }))}
                            excludeSet={[]}
                            selectedCustomSet={pf_config?.buff_id?.toString()}
                            placeholder={transI18n("selectBuff")}
                            setSelectedCustomSet={(id) => setPfConfig({ ...pf_config, buff_id: Number(id) })}
                        />
                    </div>
                )}
                {/* Turbulence Buff */}
                <div className="bg-base-200/20 rounded-lg p-4 border border-purple-500/20">
                    <h2 className="text-2xl font-bold mb-2 text-info">{transI18n("turbulenceBuff")}</h2>
                    {eventSelected && eventSelected.SubOption.length > 0 ? (
                        eventSelected.SubOption.map((subOption, index) => (
                            <div key={index}>
                                <label className="label">
                                    <span className="label-text font-bold text-success">{index + 1}. {getLocaleName(locale, subOption.Name)}</span>
                                </label>
                                <div
                                    className="text-base"
                                    dangerouslySetInnerHTML={{
                                        __html: replaceByParam(
                                            getLocaleName(locale, subOption.Desc) || "",
                                            subOption.Param || []
                                        )
                                    }}
                                />
                            </div>
                        ))
                    ) : eventSelected && challengeSelected && eventSelected.SubOption.length === 0 ? (
                        challengeSelected?.MazeBuff?.map((buff, i) => (
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

            {(pf_config?.challenge_id ?? 0) !== 0 && (
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
                                <h2 className="text-2xl font-bold mb-2 text-info">{side.wave}</h2>

                                {targetEvent && Object.values(targetEvent.Infinite || []).map((waveValue, waveIndex) => (
                                    <div key={waveIndex} className="mb-6">
                                        <h3 className="text-lg font-semibold">{transI18n("wave")} {waveIndex + 1}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Array.from(new Set(waveValue.MonsterList)).map((monsterId, enemyIndex) => {
                                                const monsterStats = calcMonsterStats(
                                                    mapMonster?.[monsterId.toString()],
                                                    waveValue.EliteGroup,
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
                                                            {mapMonster?.[monsterId.toString()]?.Image?.IconPath && (
                                                                <div className="relative w-16 h-16 rounded-full border-2 border-base-300 shadow-md overflow-hidden group-hover:scale-110 transition-transform duration-300 bg-base-100">
                                                                    <Image
                                                                        unoptimized
                                                                        crossOrigin="anonymous"
                                                                        src={`${process.env.CDN_URL}/${mapMonster?.[monsterId.toString()]?.Image?.IconPath}`}
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
                                                                    {mapMonster?.[monsterId.toString()]?.StanceWeakList?.map((icon, iconIndex) => (
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
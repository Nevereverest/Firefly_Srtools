"use client";
import { useEffect, useMemo } from "react";
import SelectCustomText from "../select/customSelectText";
import { calcMonsterStats, getLocaleName, replaceByParam } from "@/helper";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MonsterStore } from "@/types";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";

export default function PeakBar() {
  const { locale } = useLocaleStore(
    useShallow((state) => ({ locale: state.locale })),
  );
  const { peak_config, setPeakConfig } = useUserDataStore(
    useShallow((state) => ({
      peak_config: state.peak_config,
      setPeakConfig: state.setPeakConfig,
    })),
  );
  const { mapMonster, mapPeak, damageType, eliteConfig, hardLevelConfig } =
    useDetailDataStore(
      useShallow((state) => ({
        mapMonster: state.mapMonster,
        mapPeak: state.mapPeak,
        damageType: state.damageType,
        eliteConfig: state.eliteConfig,
        hardLevelConfig: state.hardLevelConfig,
      })),
    );
  const transI18n = useTranslations("DataPage");

  const listFloor = useMemo(() => {
    const peak = mapPeak?.[peak_config?.event_id?.toString()];
    if (!peak) return [];

    return [...peak.PreLevel, peak.BossLevel].filter((it) => it != null);
  }, [peak_config, mapPeak]);
  const eventSelected = useMemo(() => {
    return mapPeak?.[peak_config?.event_id?.toString()];
  }, [peak_config, mapPeak]);

  const bossConfig = useMemo(() => {
    return mapPeak?.[peak_config?.event_id?.toString()]?.BossConfig;
  }, [peak_config, mapPeak]);

  const challengeSelected = useMemo(() => {
    const challenge = structuredClone(
      listFloor?.find((peak) => peak?.ID === peak_config.challenge_id),
    );
    if (
      challenge &&
      challenge.ID ===
        mapPeak?.[peak_config?.event_id?.toString()]?.BossLevel?.ID &&
      bossConfig &&
      peak_config?.boss_mode === "Hard"
    ) {
      return { challenge: bossConfig, isBoss: true };
    }
    return {
      challenge: challenge,
      isBoss:
        challenge?.ID ===
        mapPeak?.[peak_config?.event_id?.toString()]?.BossLevel?.ID,
    };
  }, [peak_config, listFloor, mapPeak, bossConfig]);

  useEffect(() => {
    if (!challengeSelected.challenge) return;
    if (
      peak_config.event_id !== 0 &&
      peak_config.challenge_id !== 0 &&
      challengeSelected
    ) {
      const newBattleConfig = structuredClone(peak_config);
      newBattleConfig.cycle_count = 6;
      newBattleConfig.blessings = [];
      for (const value of challengeSelected?.challenge?.MazeBuff) {
        newBattleConfig.blessings.push({
          id: value.ID,
          level: 1,
        });
      }
      if (peak_config.buff_id !== 0 && challengeSelected.isBoss) {
        newBattleConfig.blessings.push({
          id: peak_config.buff_id,
          level: 1,
        });
      }
      newBattleConfig.monsters = [];
      newBattleConfig.stage_id = challengeSelected.challenge.EventList[0].ID;

      if (challengeSelected.challenge.EventList[0].Invasion) {
        console.log("Adding Invasion Buff", challengeSelected.challenge.EventList[0].Invasion.MazeBuff.ID);
        newBattleConfig.blessings.push({
          id: challengeSelected.challenge.EventList[0].Invasion.MazeBuff.ID,
          level: 1,
        });
      }
      for (const wave of challengeSelected.challenge.EventList[0].MonsterList) {
        if (!wave) continue;
        const newWave: MonsterStore[] = [];
        for (const value of Object.values(wave)) {
          if (!value) continue;
          newWave.push({
            monster_id: value,
            level: challengeSelected.challenge.EventList[0].Level,
            amount: 1,
          });
        }
        newBattleConfig.monsters.push(newWave);
      }

      setPeakConfig(newBattleConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    peak_config.event_id,
    peak_config.challenge_id,
    peak_config.buff_id,
    peak_config.boss_mode,
    mapPeak,
  ]);

  if (!mapPeak) return null;

  return (
    <div className="pt-4 pb-2 relative space-y-4">
      {/* Title Card */}
      <div className="rounded-xl p-4 border border-warning">
        <div className="mb-4 w-full">
          <SelectCustomText
            customSet={Object.values(mapPeak)
              .sort((a, b) => b.ID - a.ID)
              .map((peak) => ({
                id: peak.ID.toString(),
                name: `${getLocaleName(locale, peak.Name)} (${peak.ID})`,
              }))}
            excludeSet={[]}
            selectedCustomSet={peak_config.event_id.toString()}
            placeholder={transI18n("selectPEAKEvent")}
            setSelectedCustomSet={(id) =>
              setPeakConfig({
                ...peak_config,
                event_id: Number(id),
                challenge_id: 0,
                buff_id: 0,
              })
            }
          />
        </div>
        {/* Settings */}
        <div
          className={`grid grid-cols-1 
                    ${eventSelected && eventSelected.BossLevel?.ID === peak_config.challenge_id ? "md:grid-cols-2" : ""}
                    gap-4 mb-2 justify-items-center items-center w-full`}
        >
          <div className="flex items-center gap-2 w-full">
            <label className="label">
              <span className="label-text font-bold text-success">
                {transI18n("floor")}:{" "}
              </span>
            </label>
            <select
              value={peak_config.challenge_id}
              className="select select-success w-full"
              onChange={(e) =>
                setPeakConfig({
                  ...peak_config,
                  challenge_id: Number(e.target.value),
                })
              }
            >
              <option value={0} disabled={true}>
                {transI18n("selectFloor")}
              </option>
              {listFloor.map((peak) => (
                <option key={peak.ID} value={peak.ID}>
                  {getLocaleName(locale, peak.Name)}
                </option>
              ))}
            </select>
          </div>
          {eventSelected &&
            eventSelected.BossLevel?.ID === peak_config.challenge_id && (
              <div className="flex items-center gap-2 w-full">
                <label className="label">
                  <span className="label-text font-bold text-success">
                    {transI18n("mode")}:{" "}
                  </span>
                </label>
                <select
                  value={peak_config.boss_mode}
                  className="select select-success w-full"
                  onChange={(e) =>
                    setPeakConfig({ ...peak_config, boss_mode: e.target.value })
                  }
                >
                  <option value={0} disabled={true}>
                    {transI18n("selectSide")}
                  </option>
                  <option value="Normal">{transI18n("normalMode")}</option>
                  <option value="Hard">{transI18n("hardMode")}</option>
                </select>
              </div>
            )}
        </div>
        <div className="label-text font-bold text-success mb-2">
          StageId: {peak_config?.stage_id}
        </div>
        {eventSelected &&
          eventSelected.BossLevel?.ID === peak_config.challenge_id &&
          bossConfig && (
            <div className="mb-4 w-full">
              <SelectCustomText
                customSet={bossConfig.BuffList.map((buff) => ({
                  id: buff.ID.toString(),
                  name: getLocaleName(locale, buff?.Name || ""),
                  description: replaceByParam(
                    getLocaleName(locale, buff?.Desc || ""),
                    buff?.Param || [],
                  ),
                }))}
                excludeSet={[]}
                selectedCustomSet={peak_config?.buff_id?.toString()}
                placeholder={transI18n("selectBuff")}
                setSelectedCustomSet={(id) =>
                  setPeakConfig({ ...peak_config, buff_id: Number(id) })
                }
              />
            </div>
          )}

        {/* Turbulence Buff */}
        <div className="pt-3 border-t border-base-content/10 space-y-2">
          <h2 className="text-xl font-bold text-info">
            {transI18n("turbulenceBuff")}
          </h2>

          {challengeSelected?.challenge &&
          challengeSelected?.challenge?.MazeBuff?.length > 0 ? (
            challengeSelected.challenge.MazeBuff.map((subOption, index) => (
              <div key={index} className="space-y-1">
                <span className="font-bold text-success text-sm">
                  {index + 1}. {getLocaleName(locale, subOption.Name)}
                </span>
                <div
                  className="text-sm text-base-content/85 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: replaceByParam(
                      getLocaleName(locale, subOption.Desc),
                      subOption.Param || [],
                    ),
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-sm text-base-content/50 italic">
              {transI18n("noTurbulenceBuff")}
            </div>
          )}
        </div>
      </div>

      {/* Enemy Waves */}

      {(peak_config?.challenge_id ?? 0) !== 0 && (
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl p-4 border border-warning">
            <h2 className="text-2xl font-bold mb-2 text-info">
              {getLocaleName(locale, challengeSelected?.challenge?.Name)}
            </h2>

            {challengeSelected?.challenge &&
              Object.values(
                challengeSelected?.challenge?.EventList?.[0]?.Infinite || [],
              ).map((waveValue, waveIndex) => (
                <div key={waveIndex} className="mb-6">
                  <h3 className="text-lg font-semibold">
                    {transI18n("wave")} {waveIndex + 1}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(new Set(waveValue.MonsterList)).map(
                      (monsterId, enemyIndex) => {
                        const monsterStats = calcMonsterStats(
                          mapMonster?.[monsterId.toString()],
                          waveValue.EliteGroup,
                          challengeSelected?.challenge?.EventList?.[0]
                            ?.HardLevelGroup || 0,
                          challengeSelected?.challenge?.EventList?.[0]?.Level ||
                            0,
                          hardLevelConfig,
                          eliteConfig,
                        );
                        return (
                          <div
                            key={enemyIndex}
                            className="group relative flex flex-col w-40 bg-base-100 rounded-2xl border border-base-300 shadow-md"
                          >
                            <div className="badge badge-warning badge-sm font-bold absolute top-2 right-2 z-10 shadow-sm">
                              Lv.{" "}
                              {
                                challengeSelected?.challenge?.EventList?.[0]
                                  ?.Level
                              }
                            </div>

                            <div className="relative w-full h-20 bg-base-200 flex items-center justify-center p-4 rounded-t-2xl">
                              {mapMonster?.[monsterId.toString()]?.Image
                                ?.IconPath && (
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
                                  <span className="text-xs font-semibold text-error">
                                    HP
                                  </span>
                                  <span className="text-sm font-bold text-base-content">
                                    {monsterStats.hp.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center bg-base-200 px-2.5 py-1.5 rounded-lg">
                                  <span className="text-xs font-semibold text-info">
                                    Speed
                                  </span>
                                  <span className="text-sm font-bold text-base-content">
                                    {monsterStats.spd.toLocaleString(
                                      undefined,
                                      { maximumFractionDigits: 0 },
                                    )}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center bg-base-200 px-2.5 py-1.5 rounded-lg">
                                  <span className="text-xs font-semibold text-base-content/70">
                                    Toughness
                                  </span>
                                  <span className="text-sm font-bold text-base-content">
                                    {monsterStats.stance.toLocaleString(
                                      undefined,
                                      { maximumFractionDigits: 0 },
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t border-base-300 flex flex-col items-center">
                                <span className="text-[10px] text-base-content/60 font-bold uppercase tracking-widest mb-1.5">
                                  Weakness
                                </span>
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {mapMonster?.[
                                    monsterId.toString()
                                  ]?.StanceWeakList?.map((icon, iconIndex) => (
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
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

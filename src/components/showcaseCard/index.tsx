"use client";
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FastAverageColor } from 'fast-average-color';
import NextImage from 'next/image';
import ParseText from '../parseText';
import useLocaleStore from '@/stores/localeStore';
import { calcAffixBonus, calcBaseStat, calcBaseStatRaw, calcBonusStatRaw, calcMainAffixBonus, calcMainAffixBonusRaw, calcPromotion, calcSubAffixBonusRaw, convertToRoman, getNameChar, replaceByParam } from '@/helper';
import useUserDataStore from '@/stores/userDataStore';
import { traceShowCaseMap } from '@/constant/traceConstant';
import { mappingStats } from '@/constant/constant';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import RelicShowcase from './relicShowcase';
import useDetailDataStore from '@/stores/detailDataStore';
import useCurrentDataStore from '@/stores/currentDataStore';
import { getLocaleName } from '@/helper';
import { useShallow } from 'zustand/react/shallow';


export default function ShowCaseInfo() {
  const { avatarSelected } = useCurrentDataStore(
    useShallow((state) => ({ avatarSelected: state.avatarSelected }))
  )
  const { mainAffix, subAffix, mapRelicSet, mapAvatar, mapLightCone, baseType, damageType } = useDetailDataStore(
    useShallow((state) => ({
      mainAffix: state.mainAffix,
      subAffix: state.subAffix,
      mapRelicSet: state.mapRelicSet,
      mapAvatar: state.mapAvatar,
      mapLightCone: state.mapLightCone,
      baseType: state.baseType,
      damageType: state.damageType,
    }))
  )
  const { avatars } = useUserDataStore(
    useShallow((state) => ({ avatars: state.avatars }))
  )
  const [avgColor, setAvgColor] = useState('#222');
  const imgRef = useRef(null);
  const cardRef = useRef(null)
  const { locale } = useLocaleStore(
    useShallow((state) => ({ locale: state.locale }))
  )
  const transI18n = useTranslations("DataPage")

  const handleSaveImage = useCallback(() => {
    if (cardRef.current === null || !avatarSelected) {
      toast.error("Avatar showcase not found!");
      return;
    }

    import("html2canvas-pro")
      .then(({ default: html2canvas }) =>
        html2canvas(cardRef.current!, {
          scale: 2,
          backgroundColor: "#000000",
          allowTaint: false,
          useCORS: true
        })
      )
      .then((canvas: HTMLCanvasElement) => {
        const link = document.createElement("a");
        link.download = `${getNameChar(locale, transI18n, avatarSelected)}_showcase.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch(() => {
        toast.error("Error generating showcase card!");
      });
  }, [avatarSelected, locale, transI18n]);

  useEffect(() => {
    if (!avatarSelected) return;
    const fac = new FastAverageColor();
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = `${process.env.CDN_URL}/${avatarSelected?.Image?.AvatarCutinFrontImgPath}`;

    img.onload = () => {
      fac.getColorAsync(img)
        .then((color) => {
          setAvgColor(color.hex);
        })
        .catch(e => console.error("Error:", e));
    };
    return () => {
      fac.destroy();
      img.onload = null;
    };
  }, [avatarSelected]);

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

  const lightconeStats = useMemo(() => {
    if (!avatarSelected || !avatarProfile?.lightcone || !mapLightCone?.[avatarProfile?.lightcone?.item_id]) return
    const promotion = calcPromotion(avatarProfile?.lightcone?.level)
    const atkStat = calcBaseStat(
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseAttack,
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseAttackAdd,
      0,
      avatarProfile?.lightcone?.level
    )
    const hpStat = calcBaseStat(
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseHP,
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseHPAdd,
      0,
      avatarProfile?.lightcone?.level
    )
    const defStat = calcBaseStat(
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseDefence,
      mapLightCone[avatarProfile?.lightcone?.item_id]?.Stats?.[promotion]?.BaseDefenceAdd,
      0,
      avatarProfile?.lightcone?.level
    )
    return {
      attack: atkStat,
      hp: hpStat,
      def: defStat,
    }
  }, [avatarSelected, mapLightCone, avatarProfile])

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

  const totalSubStats = useMemo(() => {
    if (!relicStats?.length) return 0
    return (relicStats ?? []).reduce((acc, relic) => {
      const subAffixList = relic?.subAffix ?? []
      return acc + subAffixList.reduce((subAcc, subAffix) => {
        if (avatarSelected?.Relics?.SubAffixPropertyList.findIndex(it => it === subAffix.property) !== -1) {
          return subAcc + (subAffix?.count ?? 0)
        }
        return subAcc
      }, 0)
    }, 0)
  }, [relicStats, avatarSelected])

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
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHP,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHPAdd,
        avatarProfile?.lightcone?.level
      )
      statsData.HP.base += calcBaseStatRaw(
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHP,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseHPAdd,
        avatarProfile?.lightcone?.level
      )
      statsData.ATK.value += calcBaseStatRaw(
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseAttack,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseAttackAdd,
        avatarProfile?.lightcone?.level
      )
      statsData.ATK.base += calcBaseStatRaw(
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseAttack,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseAttackAdd,
        avatarProfile?.lightcone?.level
      )
      statsData.DEF.value += calcBaseStatRaw(
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseDefence,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseDefenceAdd,
        avatarProfile?.lightcone?.level
      )
      statsData.DEF.base += calcBaseStatRaw(
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseDefence,
        mapLightCone?.[avatarProfile?.lightcone?.item_id]?.Stats[lightconePromotion]?.BaseDefenceAdd,
        avatarProfile?.lightcone?.level
      )

      const bonusData = mapLightCone[avatarProfile?.lightcone?.item_id]?.Skills?.Level?.[avatarProfile?.lightcone.rank]?.Bonus
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

  const applyBrightness = useCallback((hex: string, brightness: number): string => {
    const r = Math.round(parseInt(hex.slice(1, 3), 16) * brightness);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) * brightness);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) * brightness);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }, [])

  return (
    <div className="w-full space-y-4">
      <div className="bg-base-100 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-content/10 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5">
            <div className="w-2 h-6 bg-linear-to-b from-primary to-accent rounded-full"></div>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
              {transI18n("showcaseCard")}
            </span>
          </h2>
          <button
            className="btn btn-sm btn-primary rounded-xl font-bold shadow-xs active-press"
            onClick={handleSaveImage}
          >
            {transI18n("save")}
          </button>
        </div>

        <div className="overflow-auto rounded-2xl">
          <div
            ref={cardRef}
            className="relative min-h-162.5 w-400 rounded-3xl transition-all duration-500 overflow-hidden text-white"
            style={{
              backgroundColor: `${applyBrightness(avgColor, 0.3)}`,
              backdropFilter: "blur(50px)",
              WebkitBackdropFilter: "blur(50px)",
            }}
          >
          <div className="absolute bottom-2 left-4 z-10">
            <span className="shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]"></span>
          </div>
          <div className="flex flex-row items-center">
            <div
              className="relative min-h-162.5 w-[24%]"
            >
              <div className="flex justify-center items-center w-full h-full overflow-hidden">
                {avatarSelected && (
                  <NextImage
                    ref={imgRef}
                    unoptimized
                    crossOrigin="anonymous"
                    src={`${process.env.CDN_URL}/${avatarSelected?.Image?.AvatarCutinFrontImgPath}`}
                    className="object-contain scale-[2] overflow-hidden"
                    alt="Character Preview"
                    width={1024}
                    height={1024}
                    priority={true}
                    style={{
                      position: 'absolute',
                      top: `130px`,
                      left: `0px`,
                    }}
                  />
                )}
              </div>
            </div>

            <div
              className="relative flex min-h-162.5 w-[76%] flex-row items-center gap-3.5 rounded-3xl pl-10 z-10 transition-all duration-500"
              style={{
                backgroundColor: `${applyBrightness(avgColor, 0.5)}`,
                backdropFilter: "blur(50px)",
                WebkitBackdropFilter: "blur(50px)",
              }}
            >

              <div className="absolute top-4 left-3">
                {avatarSelected && avatarSelected && avatarData?.data && typeof avatarData?.data?.rank === "number" && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    {Object.values(avatarSelected?.Ranks || {})?.map((rank, index) => {
                      const isActive = avatarData?.data?.rank > index;
                      return (
                        <div
                          key={index}
                          className="relative flex items-center justify-center"
                          style={{
                            transition: "transform 0.3s ease, filter 0.3s ease",
                          }}
                        >

                          {isActive && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                background: "radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)",
                                filter: "blur(6px)",
                                zIndex: 0,
                              }}
                            />
                          )}

                          <div
                            className="relative rounded-full p-[2.5px]"
                            style={{
                              background: isActive
                                ? "linear-gradient(135deg, #facc15, #f59e0b, #facc15)"
                                : "rgba(255,255,255,0.15)",
                              boxShadow: isActive
                                ? "0 0 10px rgba(250,204,21,0.5), 0 0 24px rgba(250,204,21,0.2)"
                                : "0 2px 6px rgba(0,0,0,0.4)",
                              transition: "background 0.3s ease, box-shadow 0.3s ease",
                              zIndex: 1,
                            }}
                          >
                            <div
                              className="rounded-full overflow-hidden"
                              style={{
                                padding: "2px",
                                background: "#1e2230",
                              }}
                            >
                              <NextImage
                                src={`${process.env.CDN_URL}/${rank.Icon}`}
                                alt="Rank Icon"
                                width={125}
                                height={125}
                                unoptimized
                                crossOrigin="anonymous"
                                className="block rounded-full object-contain"
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  filter: isActive
                                    ? "grayscale(0) brightness(1.05) saturate(1.1)"
                                    : "grayscale(0.7) brightness(0.55)",
                                  transition: "filter 0.3s ease",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              <div className="flex h-162.5 w-1/3 flex-col justify-between py-3 pl-8">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex flex-row items-center justify-between">
                      <ParseText className="text-3xl" text={getNameChar(locale, transI18n, avatarSelected || undefined)} locale={locale} />
                    </div>
                    <div className="flex flex-row items-center gap-4 mt-2">
                      <div className="text-2xl text-[#d8b46e]">Lv. <span className="text-white">{avatarData?.level}</span>/<span className="text-neutral-400">80</span></div>
                      <div className="flex items-center justify-center min-w-8 h-8 px-1.5 rounded-full text-base font-bold text-[#E6D5B5] bg-[#5c4022] border-2 border-[#d8b46e] shadow-[0_0_10px_rgba(250,204,21,0.3)] select-none">
                        {totalSubStats}
                      </div>

                      {avatarSelected && (
                        <div className="flex gap-1">
                          <NextImage
                            unoptimized
                            crossOrigin="anonymous"
                            src={`${process.env.CDN_URL}/${baseType[avatarSelected?.BaseType]?.Icon}`}
                            alt="Path Icon"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                          />
                          <NextImage
                            unoptimized
                            crossOrigin="anonymous"
                            src={`${process.env.CDN_URL}/${damageType[avatarSelected?.DamageType]?.Icon}`}
                            alt="Element Icon"
                            width={32}
                            height={32}
                            className="h-8 w-8" />

                        </div>
                      )}

                    </div>
                  </div>

                  <div className="relative flex h-56.25 flex-row items-center">
                    {avatarSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <NextImage
                          unoptimized
                          crossOrigin="anonymous"
                          src={`${process.env.CDN_URL}/${baseType[avatarSelected?.BaseType]?.Icon}`}
                          alt="Path Icon"
                          width={160}
                          height={160}
                          className="h-40 w-40 opacity-20"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {avatarData && avatarSelected && avatarSkillTree && traceShowCaseMap[avatarSelected?.BaseType || ""]
                        && Object.values(traceShowCaseMap[avatarSelected?.BaseType || ""] || []).map((item, index) => {

                          return (
                            <div key={`row-${index}`} className="flex flex-row items-center">
                              {item.map((btn, idx) => {
                                const size = btn.size || "small";
                                const isBig = size === "big";
                                const isMedium = size === "medium";
                                const isBigMemory = size === "big-memory";

                                const sizeClass = isBigMemory ? "w-12 h-12 mx-1" : isBig ? "w-12 h-12 mx-1" : isMedium ? "w-10 h-10" : "w-8 h-8";

                                const imageSize = isBigMemory ? "w-10 h-10" : isBig ? "w-10 h-10" : isMedium ? "w-8 h-8" : "w-6 h-6";

                                const bgColor = isBigMemory
                                  ? "bg-[#2a1a39]/80"
                                  : isBig
                                    ? "bg-[#2b1d00]/80"
                                    : isMedium
                                      ? "bg-[#2b1d00]/50"
                                      : "bg-[#000000]/50";

                                const filterClass = isBigMemory
                                  ? "filter sepia brightness-80 hue-rotate-[280deg] saturate-400 contrast-130"
                                  : isBig
                                    ? "filter sepia brightness-150 hue-rotate-15 saturate-200"
                                    : "";

                                if (!avatarSkillTree?.[btn.id]) {
                                  return null;
                                }
                                return (
                                  <div key={`item-${idx}`} className="relative flex flex-row items-center">
                                    <div
                                      className={
                                        `relative flex items-center justify-center shrink-0 ${sizeClass} 
                                        rounded-full ${bgColor} border-2 border-gray-500
                                        ${avatarData.data.skills[avatarSkillTree?.[btn.id]?.["1"]?.PointID] ? "" : "opacity-50"}
                                      `}
                                    >
                                        <NextImage
                                          src={`${process.env.CDN_URL}/${avatarSelected?.SkillTrees?.[btn.id]?.["1"]?.Icon}`}
                                          unoptimized
                                          crossOrigin="anonymous"
                                          alt={btn.id}
                                          width={125}
                                          height={125}
                                          className={`${imageSize} object-contain ${filterClass}`}
                                        />

                                      {(isBig || isBigMemory) && (
                                        <span className="absolute bottom-0 left-0 text-[12px] text-white bg-black/70 px-1 rounded-sm">
                                          {avatarData?.data?.skills?.[avatarSkillTree?.[btn.id]?.["1"]?.PointID] ? avatarData?.data?.skills?.[avatarSkillTree?.[btn.id]?.["1"]?.PointID] : 1}
                                        </span>
                                      )}
                                    </div>

                                    {btn.isLink && idx < item.length - 1 && (
                                      <div className="w-3 h-0.75 bg-white opacity-80 mx-1" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                          )
                        })}
                    </div>

                  </div>
                  {avatarProfile && avatarProfile?.lightcone && lightconeStats ? (
                    <div className="flex flex-row items-center justify-center mb-2">

                      <div className="relative w-36 h-48">
                        {/* Background SVG Border (offset top-left) */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute w-full h-full z-10"
                          style={{
                            color: '#f59e0b',
                            opacity: 0.7,
                            top: '0px',
                            left: '-1px'
                          }}
                          viewBox="0 0 5 7"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.9"
                            strokeWidth="0.065"
                            d="m.301.032-.269.25v6.436l.303.25h4.364l.269-.25V.282l-.269-.25z"
                          />
                        </svg>

                        {/* Card Image */}
                        <NextImage
                          className="absolute object-contain rounded-xl z-9 w-[95%]"
                          unoptimized
                          crossOrigin="anonymous"
                          src={`${process.env.CDN_URL}/spriteoutput/lightconemaxfigures/${avatarProfile?.lightcone.item_id}.png`}
                          alt="Lightcone Image"
                          width={904}
                          height={1206}
                          priority
                          style={{
                            top: '0px',
                            left: '6px',
                          }}
                        />

                        {/* Top SVG Border (offset bottom-right) */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute w-full h-full z-8"
                          style={{
                            color: '#f59e0b',
                            opacity: 0.8,
                            bottom: '0px',
                            right: '-4px'
                          }}
                          viewBox="0 0 5 7"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.9"
                            strokeWidth="0.065"
                            d="m.301.032-.269.25v6.436l.303.25h4.364l.269-.25V.282l-.269-.25z"
                          />
                          <path
                            d="M.34.004 0 .268v6.464l.33.233L4.71 7 5 6.732V.268L4.71 0Zm.01.06L4.693.03l.22.268.023 6.406-.25.233-4.34.02-.25-.253L.018.297z"
                            style={{
                              fill: 'currentColor',
                              opacity: 0.3
                            }}
                          />
                        </svg>

                        {/* Stars */}
                        <div
                          className="absolute text-yellow-500 font-bold z-10"
                          style={{
                            writingMode: 'vertical-rl',
                            left: '-0.5rem',
                            top: '0.5rem',
                            fontSize: '1.1rem',
                            letterSpacing: '-0.1em',
                            textShadow: `
                            0 0 0.2em #f59e0b,
                            0 0 0.4em #f59e0b,
                            0 0 0.8em #f59e0b,
                            -0.05em -0.05em 0.05em rgba(0,0,0,0.7),
                            0.05em 0.05em 0.05em rgba(0,0,0,0.7)
                          `
                          }}
                        >
                          {[...Array(
                            Number(
                              mapLightCone[avatarProfile?.lightcone?.item_id]?.Rarity?.[
                              mapLightCone[avatarProfile?.lightcone?.item_id]?.Rarity.length - 1
                              ] || 0
                            )
                          )].map((_, i) => (
                            <span key={i}>✦</span>
                          ))}
                        </div>
                      </div>


                      <div className="flex w-2/5 flex-col gap-2 text-white ml-2 h-full">
                        <div className="flex flex-col h-full">
                          <div className="flex items-center h-full">
                            <div className="w-1 h-[70%] bg-yellow-400 mr-2 rounded" />
                            <ParseText
                              className="text-lg font-semibold"
                              locale={locale}
                              text={getLocaleName(locale, mapLightCone[avatarProfile?.lightcone?.item_id].Name)}
                            />

                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[#d8b46e]">
                            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-[#5c4022] border border-[#d8b46e] text-[#d8b46e] text-xs font-medium">
                              {convertToRoman(avatarProfile?.lightcone?.rank)}
                            </div>
                            <span>
                              Lv. <span className="text-white">{avatarProfile.lightcone.level}</span>/<span className="text-neutral-400">80</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-center items-center flex-col gap-1 mt-1 ">
                          <div className="flex gap-1 text-sm ">
                            <div className="flex items-center gap-1 rounded bg-black/30 px-1 w-fit py-1">
                              <NextImage
                                unoptimized
                                crossOrigin="anonymous"
                                src={`${process.env.CDN_URL}/spriteoutput/ui/avatar/icon/IconMaxHP.png`}
                                alt="HP"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                              <span>{
                                lightconeStats?.hp
                              }</span>
                            </div>
                            <div className="flex items-center gap-1 rounded bg-black/30 px-1 w-fit py-1">
                              <NextImage
                                src={`${process.env.CDN_URL}/spriteoutput/ui/avatar/icon/IconAttack.png`}
                                unoptimized
                                crossOrigin="anonymous"
                                alt="ATK"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                              <span>{lightconeStats?.attack}</span>
                            </div>

                          </div>
                          <div className="flex items-center gap-1 rounded bg-black/30 px-1 w-fit py-1">
                            <NextImage
                              unoptimized
                              crossOrigin="anonymous"
                              src={`${process.env.CDN_URL}/spriteoutput/ui/avatar/icon/IconDefence.png`}
                              alt="DEF"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span>{lightconeStats?.def}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (<div className="flex h-1/4 items-center text-lg">
                    {transI18n("noLightconeEquipped")}
                  </div>)}
                </div>

              </div>

              <div className="flex h-162.5 w-1/3 flex-col justify-between py-3 z-10 text-white">
                <div className="flex w-full flex-col justify-between gap-y-0.5 text-base h-125 text-white">
                  {Object.entries(characterStats || {})?.map(([key, stat], index) => {
                    if (!stat || (key.includes("Add") && stat.value === 0)) return null
                    return (
                      <div key={index} className="flex flex-row items-center justify-between text-white">
                        <div className="flex flex-row items-center">
                          <NextImage src={`${process.env.CDN_URL}/${stat?.icon}`}
                            unoptimized
                            crossOrigin="anonymous"
                            alt="Stat Icon"
                            width={40}
                            height={40}
                            className="h-10 w-10 p-2"
                          />
                          <span className="font-bold text-white">{stat.name}</span>
                        </div>
                        <div className="ml-3 mr-3 grow border-b border-white/20" />
                        <div className="flex cursor-default flex-col text-right font-bold text-white">{
                          stat.value ? stat.unit === "%" ? (stat.value * 100).toFixed(stat.round) : stat.value.toFixed(stat.round) : 0
                        }{stat.unit}</div>
                      </div>
                    )
                  })}
                  <hr className="border-white/20" />
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
                          <span className="black-blur bg-black/30 flex w-5 justify-center rounded px-1.5 py-0.5">{setEffect.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="w-1/3 z-10">
                <div className="flex h-162.5 flex-col justify-between py-3 mr-1 text-lg w-full" >

                  {relicStats?.map((relic, index) => {
                    if (!relic || !avatarSelected) return null
                    return (
                      <RelicShowcase key={index} relic={relic} avatarInfo={avatarSelected} />
                    )
                  })}

                  {(!relicStats || !relicStats?.length) && (
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-center p-6">
                        <span className="text-lg text-white">{transI18n("noRelicEquipped")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}

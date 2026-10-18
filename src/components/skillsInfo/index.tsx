"use client"

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { traceButtonsInfo, traceLink } from "@/constant/traceConstant";
import useUserDataStore from "@/stores/userDataStore";
import useLocaleStore from "@/stores/localeStore";
import Image from "next/image";
import { replaceByParam, getLocaleName } from '@/helper';
import { mappingStats } from "@/constant/constant";
import { toast } from "react-toastify";
import useCurrentDataStore from "@/stores/currentDataStore";
import { StatusAdd } from '@/types/avatarDetail';
import { SkillDescription } from "./skillDescription";
import { useShallow } from "zustand/react/shallow";

export default function SkillsInfo() {
    const transI18n = useTranslations("DataPage")
    const { theme, locale } = useLocaleStore(
        useShallow((state) => ({ theme: state.theme, locale: state.locale }))
    )
    const { avatarSelected, skillIDSelected, setSkillIDSelected } = useCurrentDataStore(
        useShallow((state) => ({
            avatarSelected: state.avatarSelected,
            skillIDSelected: state.skillIDSelected,
            setSkillIDSelected: state.setSkillIDSelected,
        }))
    )
    const { avatars, setAvatar } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            setAvatar: state.setAvatar,
        }))
    )
    const traceButtons = useMemo(() => {
        if (!avatarSelected) return
        return traceButtonsInfo[avatarSelected.BaseType]
    }, [avatarSelected])

    const avatarData = useMemo(() => {
        if (!avatarSelected) return
        return avatars[avatarSelected?.ID?.toString()]
    }, [avatarSelected, avatars])

    const avatarSkillTree = useMemo(() => {
        if (!avatarSelected || !avatars[avatarSelected?.ID?.toString()]) return {}
        if (avatars[avatarSelected?.ID?.toString()].enhanced) {
            return avatarSelected?.Enhanced?.[avatars[avatarSelected?.ID?.toString()].enhanced.toString()].SkillTrees || {}
        }
        return avatarSelected?.SkillTrees || {}
    }, [avatarSelected, avatars])

    const skillInfo = useMemo(() => {
        if (!avatarSelected || !skillIDSelected) return
        return avatarSkillTree?.[skillIDSelected || ""]?.["1"]
    }, [avatarSelected, avatarSkillTree, skillIDSelected])

    const getTraceBuffDisplay = (status: StatusAdd) => {
        const dataDisplay = mappingStats[status.PropertyType]
        if (!dataDisplay) return ""
        if (dataDisplay.unit === "%") {
            return `${(status.Value * 100).toFixed(1)}${dataDisplay.unit}`
        }
        if (dataDisplay.name === "SPD") {
            return `${status.Value.toFixed(1)}${dataDisplay.unit}`
        }
        return `${status.Value.toFixed(0)}${dataDisplay.unit}`
    }

    const dataLevelUpSkill = useMemo(() => {
        const skillIds: number[] = skillInfo?.LevelUpSkillID || []
        if (!avatarSelected || !avatarData) return undefined
        let result = Object.values(avatarSelected.Skills || {})?.filter((skill) => skillIds.includes(skill.ID))
        if (avatarData.enhanced) {
            result = Object.values(avatarSelected?.Enhanced?.[avatarData.enhanced.toString()]?.Skills || {})?.filter((skill) => skillIds.includes(skill.ID))
        }

        if (result && result.length > 0) {
            return {
                isServant: false,
                data: result,
                servantData: null,
            }
        }
        const resultServant = Object.values(avatarSelected?.Memosprite?.Skills || {})
            ?.filter((skill) => skillIds.includes(skill.ID))

        if (resultServant && resultServant.length > 0) {
            return {
                isServant: true,
                data: resultServant,
                servantData: avatarSelected.Memosprite,
            }
        }
        return undefined
    }, [skillInfo?.LevelUpSkillID, avatarSelected, avatarData])


    const handlerMaxAll = () => {
        if (!avatarData || !avatarSkillTree) {
            toast.error(transI18n("maxAllFailed"))
            return
        }
        const newData = structuredClone(avatarData)
        newData.data.skills = Object.values(avatarSkillTree).reduce((acc, dataPointEntry) => {
            const firstEntry = Object.values(dataPointEntry)[0];
            if (firstEntry) {
                acc[firstEntry.PointID] = firstEntry.MaxLevel;
            }
            return acc;
        }, {} as Record<string, number>)
        toast.success(transI18n("maxAllSuccess"))
        setAvatar(newData)
    }

    const handlerChangeStatusTrace = (status: boolean) => {
        if (!avatarData || !skillInfo) return
        const newData = structuredClone(avatarData)
        newData.data.skills[skillInfo?.PointID] = status ? 1 : 0

        if (!status && traceLink?.[avatarSelected?.BaseType || ""]?.[skillIDSelected || ""]) {
            traceLink[avatarSelected?.BaseType || ""][skillIDSelected || ""].forEach((pointId) => {
                if (avatarSkillTree?.[pointId]?.["1"]) {
                    newData.data.skills[avatarSkillTree?.[pointId]?.["1"].PointID] = 0
                }
            })
        }
        setAvatar(newData)
    }

    return (
        <div className="w-full space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Left Panel: Skill Tree Visualizer */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-base-300 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-base-300">
                            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                                <div className="w-1.5 h-5 bg-linear-to-b from-primary to-accent rounded-full"></div>
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent font-bold tracking-tight">
                                    {transI18n("skills")}
                                </span>
                            </h2>
                            <button
                                className="btn btn-sm btn-primary rounded-xl font-bold shadow-xs active-press"
                                onClick={handlerMaxAll}
                            >
                                {transI18n("maxAll")}
                            </button>
                        </div>

                        {/* Visual Skill Tree Container */}
                        <div className="flex justify-center items-center py-2">
                            {traceButtons && avatarSelected && (
                                <div className="relative w-full max-w-155 aspect-square select-none">
                                    <Image
                                        unoptimized
                                        src={`/skilltree/${avatarSelected?.BaseType?.toUpperCase()}.webp`}
                                        alt={transI18n("skillTree")}
                                        width={312}
                                        priority={true}
                                        height={312}
                                        style={{
                                            filter: (theme === "winter" || theme === "cupcake") ? "invert(1)" : "none"
                                        }}
                                        className="w-full h-full object-contain pointer-events-none"
                                    />
                                    {traceButtons.map((btn, index) => {
                                        if (!avatarSelected?.SkillTrees?.[btn.id]) {
                                            return null
                                        }
                                        const isSelected = skillIDSelected === btn.id;
                                        const isLearned = !!avatarData?.data.skills?.[avatarSkillTree?.[btn.id]?.["1"]?.PointID];

                                        const isMajor = btn.size === "big" || btn.size === "memory" || btn.size === "elation";

                                        return (
                                            <div
                                                key={`${btn.id}-${index}`}
                                                id={btn.id}
                                                className={`
                                                    absolute rounded-full border border-black/70 cursor-pointer transition-all duration-150 ease-out flex justify-center items-center select-none overflow-visible
                                                    ${btn.size === "small" ? "w-[7%] h-[7%] bg-white" : ""}
                                                    ${btn.size === "medium" ? "w-[9.6%] h-[9.6%] bg-white" : ""}
                                                    ${btn.size === "big" ? "w-[10%] h-[10%] bg-black" : ""}
                                                    ${btn.size === "special" ? "w-[10%] h-[10%] bg-white" : ""}
                                                    ${btn.size === "memory" ? "w-[10%] h-[10%] bg-black" : ""}
                                                    ${btn.size === "elation" ? "w-[10%] h-[10%] bg-black" : ""}
                                                    ${isSelected ? "ring-3 ring-cyan-400 ring-offset-2 ring-offset-base-100 shadow-[0_0_12px_rgba(34,211,238,0.8)] z-20" : "hover:ring-2 hover:ring-primary/40 z-10"}
                                                    ${!isLearned ? "opacity-40 grayscale" : "shadow-[0_0_6px_rgba(255,255,255,0.4)]"}
                                                `}
                                                onClick={() => {
                                                    setSkillIDSelected(btn.id === skillIDSelected ? null : btn.id)
                                                }}
                                                style={{
                                                    left: btn.left,
                                                    top: btn.top,
                                                    transform: "translate(-50%, -50%)",
                                                }}
                                            >
                                                <Image
                                                    src={`${process.env.CDN_URL}/${avatarSelected?.SkillTrees?.[btn.id]?.["1"]?.Icon}`}
                                                    alt={btn.id.replaceAll("Point", "")}
                                                    priority={true}
                                                    unoptimized
                                                    width={124}
                                                    height={124}
                                                    style={{
                                                        objectFit: "contain",
                                                        padding: "2px",
                                                        filter: !isMajor ? "brightness(0%)" : ""
                                                    }}
                                                />

                                                {/* Skill Type Color Overlays */}
                                                {btn.size === "special" && (
                                                    <div
                                                        className="absolute inset-0 rounded-full pointer-events-none"
                                                        style={{
                                                            backgroundColor: "#4a6eff",
                                                            mixBlendMode: "screen",
                                                            opacity: 0.8,
                                                        }}
                                                    />
                                                )}
                                                {btn.size === "memory" && (
                                                    <div
                                                        className="absolute inset-0 rounded-full pointer-events-none"
                                                        style={{
                                                            backgroundColor: "#9a89ff",
                                                            mixBlendMode: "screen",
                                                            opacity: 0.45,
                                                        }}
                                                    />
                                                )}
                                                {btn.size === "elation" && (
                                                    <div
                                                        className="absolute inset-0 rounded-full pointer-events-none"
                                                        style={{
                                                            backgroundColor: "#ff8c00",
                                                            mixBlendMode: "screen",
                                                            opacity: 0.5,
                                                        }}
                                                    />
                                                )}
                                                {btn.size === "big" && (
                                                    <div
                                                        className="absolute inset-0 rounded-full pointer-events-none"
                                                        style={{
                                                            backgroundColor: "#f5e4b0",
                                                            mixBlendMode: "screen",
                                                            opacity: 0.35,
                                                        }}
                                                    />
                                                )}

                                                {isMajor && (
                                                    <p className="z-12 text-[9px] sm:text-[10px] md:text-xs font-mono font-bold text-center rounded-full absolute -bottom-1.5 bg-black/85 text-white px-1.5 py-0.2 border border-white/20 left-1/2 -translate-x-1/2 shadow-xs whitespace-nowrap pointer-events-none">
                                                        {`${avatarData?.data.skills?.[avatarSkillTree?.[btn.id]?.["1"]?.PointID] || 0}/${avatarSkillTree?.[btn.id]?.["1"]?.MaxLevel}`}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Skill Details */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-base-300 shadow-sm space-y-5">
                        <div className="pb-3 border-b border-base-300">
                            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                                <div className="w-1.5 h-5 bg-linear-to-b from-secondary to-primary rounded-full"></div>
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-secondary to-primary font-bold tracking-tight">
                                    {transI18n("details")}
                                </span>
                            </h2>
                        </div>

                        {skillIDSelected && avatarSelected?.SkillTrees && avatarData ? (
                            <div className="space-y-4">
                                {/* Level Slider */}
                                {skillInfo?.MaxLevel && skillInfo?.MaxLevel > 1 ? (
                                    <div className="space-y-1.5 pb-2">
                                        <div className="text-sm font-bold text-base-content/80">
                                            {transI18n("level")}
                                        </div>
                                        <div className="w-full max-w-sm space-y-1">
                                            <input
                                                type="range"
                                                min={1}
                                                max={skillInfo?.MaxLevel || 1}
                                                value={avatarData?.data.skills?.[skillInfo?.PointID] || 1}
                                                onChange={(e) => {
                                                    const newData = structuredClone(avatarData)
                                                    newData.data.skills[skillInfo?.PointID] = parseInt(e.target.value)
                                                    setAvatar(newData)
                                                }}
                                                className="range range-primary range-xs w-full"
                                                step="1"
                                            />
                                            <div className="flex justify-between px-1 text-[11px] font-mono text-base-content/50">
                                                {Array.from({ length: skillInfo?.MaxLevel || 1 }, (_, index) => index + 1).map((idx) => (
                                                    <span key={idx}>{idx}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : skillInfo?.MaxLevel && skillInfo?.MaxLevel === 1 && traceButtons?.find((btn) => btn.id === skillIDSelected)?.size !== "big" ? (
                                    <div className="flex items-center gap-3 pb-2">
                                        <span className="text-sm font-bold text-base-content/80">{transI18n("status")}</span>
                                        <input
                                            type="checkbox"
                                            checked={avatarData?.data.skills?.[skillInfo?.PointID] === 1}
                                            className="toggle toggle-primary toggle-sm"
                                            onChange={(e) => {
                                                if (traceButtons?.find((btn) => btn.id === skillIDSelected)?.size === "special") {
                                                    if (e.target.checked) {
                                                        const newData = structuredClone(avatarData)
                                                        newData.data.skills[skillInfo?.PointID] = 1
                                                        setAvatar(newData)
                                                        return
                                                    }
                                                    const newData = structuredClone(avatarData)
                                                    delete newData.data.skills[skillInfo?.PointID]
                                                    setAvatar(newData)
                                                    return
                                                }
                                                handlerChangeStatusTrace(e.target.checked)
                                            }}
                                        />
                                        <span className={`text-xs font-bold ${avatarData?.data.skills?.[skillInfo?.PointID] === 1 ? 'text-primary' : 'text-base-content/40'}`}>
                                            {avatarData?.data.skills?.[skillInfo?.PointID] === 1 ? transI18n("active") : transI18n("inactive")}
                                        </span>
                                    </div>
                                ) : null}

                                {/* Point Name & Stat Additions */}
                                {((skillInfo?.PointName && skillInfo?.PointDesc) ||
                                    (skillInfo?.PointName && skillInfo?.StatusAddList.length > 0)) && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-lg font-extrabold text-base-content">
                                            {getLocaleName(locale, skillInfo.PointName)}
                                        </h3>
                                        {skillInfo.StatusAddList.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {skillInfo.StatusAddList.map((status, index) => (
                                                    <span key={index} className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                                        +{getTraceBuffDisplay(status)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Skill Description Prose */}
                                {skillInfo?.PointDesc && (
                                    <div
                                        className="text-xs sm:text-sm text-base-content/85 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: replaceByParam(
                                                getLocaleName(locale, skillInfo?.PointDesc) || "",
                                                skillInfo?.Param || []
                                            )
                                        }}
                                    />
                                )}

                                {/* Level-up Skill Items (Major / Servant Skills) */}
                                {skillInfo?.LevelUpSkillID && skillInfo?.LevelUpSkillID.length > 0 && dataLevelUpSkill && (
                                    <div className="space-y-6 pt-1">
                                        {dataLevelUpSkill?.data?.map((skill, index) => (
                                            <div key={index} className={index > 0 ? "border-t border-base-content/10 pt-4" : ""}>
                                                <SkillDescription
                                                    skill={skill}
                                                    locale={locale}
                                                    avatarData={avatarData}
                                                    skillInfo={skillInfo}
                                                    attackTypeLabel={transI18n(dataLevelUpSkill.isServant ? (skill?.AttackType ? "severaltalent" : "servantskill") : (skill?.AttackType ? skill?.AttackType.toLowerCase() : "talent"))}
                                                    skillEffectLabel={skill?.SkillEffect ? transI18n(skill.SkillEffect.toLowerCase()) : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-base-content/40 text-sm italic">
                                {transI18n("selectTraceNodePrompt")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
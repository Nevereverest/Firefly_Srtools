/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import useUserDataStore from "@/stores/userDataStore";
import { useEffect, useMemo } from "react";
import LightconeBar from '../lightconeBar'
import { calcPromotion, calcRarity, replaceByParam } from '@/helper';
import { getSkillTree } from '@/helper/getSkillTree';
import { useTranslations } from 'next-intl';
import ParseText from '../parseText';
import useLocaleStore from '@/stores/localeStore';
import useModelStore from '@/stores/modelStore';
import Image from 'next/image';
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";
import { getLocaleName } from "@/helper/getName";
import { useShallow } from "zustand/react/shallow";

export default function AvatarInfo() {
    const { avatarSelected, setResetDataLightcone } = useCurrentDataStore(
        useShallow((state) => ({
            avatarSelected: state.avatarSelected,
            setResetDataLightcone: state.setResetDataLightcone,
        }))
    )
    const { avatars, setAvatars, setAvatar } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            setAvatars: state.setAvatars,
            setAvatar: state.setAvatar,
        }))
    )
    const { isOpenLightcone, setIsOpenLightcone } = useModelStore(
        useShallow((state) => ({
            isOpenLightcone: state.isOpenLightcone,
            setIsOpenLightcone: state.setIsOpenLightcone,
        }))
    )
    const { mapLightCone, baseType } = useDetailDataStore(
        useShallow((state) => ({
            mapLightCone: state.mapLightCone,
            baseType: state.baseType,
        }))
    )
    const transI18n = useTranslations("DataPage")
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    );

    const lightcone = useMemo(() => {
        if (!avatarSelected) return null;
        const avatar = avatars[avatarSelected.ID];
        return avatar?.profileList?.[avatar?.profileSelect]?.lightcone ?? avatar?.profileList?.[0]?.lightcone ?? null;
    }, [avatarSelected, avatars]);

    const handleUpdateLightcone = (updater: (lc: typeof lightcone) => typeof lightcone) => {
        if (!avatarSelected || !avatars[avatarSelected.ID]) return;
        const avatar = avatars[avatarSelected.ID];
        const profileIndex = avatar.profileSelect;
        const currentProfile = avatar.profileList?.[profileIndex];
        if (!currentProfile) return;
        const newProfileList = [...avatar.profileList];
        newProfileList[profileIndex] = {
            ...currentProfile,
            lightcone: updater(currentProfile.lightcone),
        };
        setAvatar({
            ...avatar,
            profileList: newProfileList,
        });
    };

    const lightconeDetail = useMemo(() => {
        if (!mapLightCone || !lightcone?.item_id) return null;
        return mapLightCone?.[lightcone.item_id.toString()] || null;
    }, [lightcone, mapLightCone]);

    const handleShow = (modalId: string) => {
        const modal = document.getElementById(modalId) as HTMLDialogElement | null;
        if (modal) {
            setIsOpenLightcone(true);
            modal.showModal();
        }
    };

    // Close modal handler
    const handleCloseModal = (modalId: string) => {
        setIsOpenLightcone(false);
        const modal = document.getElementById(modalId) as HTMLDialogElement | null;
        if (modal) {
            modal.close();
        }
    };

    // Handle ESC key to close modal
    useEffect(() => {
        if (!isOpenLightcone) {
            handleCloseModal("action_detail_modal");
            return;
        }

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpenLightcone) {
                handleCloseModal("action_detail_modal");
            }
        };

        window.addEventListener('keydown', handleEscKey);

        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpenLightcone]);

    return (
        <div className="w-full space-y-4">
            {avatarSelected && avatars[avatarSelected?.ID.toString() || ""] && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full items-start">
                    {/* Left Column: Character Configuration */}
                    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-base-content/10 shadow-xs flex flex-col justify-between">
                        <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between pb-4 mb-2 border-b border-base-content/10">
                                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2.5">
                                    <div className="w-1.5 h-5 bg-linear-to-b from-primary to-accent rounded-full"></div>
                                    <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent font-bold tracking-tight">
                                        {transI18n("characterSettings")}
                                    </span>
                                </h2>
                                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                    ID: #{avatarSelected.ID}
                                </span>
                            </div>

                            <div className="divide-y divide-base-content/10">
                                {/* Level Control */}
                                <div className="py-4 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-base-content tracking-tight flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {transI18n("characterLevel")}
                                        </span>
                                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/25">
                                            {avatars[avatarSelected?.ID.toString() || ""]?.level} / 80
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 pt-0.5">
                                        <input
                                            type="range"
                                            min="1"
                                            max="80"
                                            value={avatars[avatarSelected?.ID.toString() || ""]?.level}
                                            onChange={(e) => {
                                                const newLevel = Math.min(80, Math.max(1, parseInt(e.target.value) || 1));
                                                setAvatars({ ...avatars, [avatarSelected?.ID.toString() || ""]: { ...avatars[avatarSelected?.ID.toString() || ""], level: newLevel, promotion: calcPromotion(newLevel) } });
                                            }}
                                            className="range range-primary range-sm flex-1"
                                        />
                                        <button
                                            onClick={() => {
                                                setAvatars({ ...avatars, [avatarSelected?.ID.toString() || ""]: { ...avatars[avatarSelected?.ID.toString() || ""], level: 80, promotion: calcPromotion(80) } });
                                            }}
                                            className="btn btn-sm btn-primary btn-outline h-8 min-h-8 rounded-lg font-bold px-3"
                                        >
                                            {transI18n("max")}
                                        </button>
                                    </div>
                                </div>

                                {/* Ultimate Energy Control */}
                                <div className="py-4 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-base-content tracking-tight flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            {transI18n("ultimateEnergy")}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-amber-500">
                                                {Math.round(avatars[avatarSelected?.ID.toString() || ""]?.sp_value)} / {avatars[avatarSelected?.ID.toString() || ""]?.sp_max}
                                            </span>
                                            <span className="text-xs font-mono text-base-content/70 font-semibold">
                                                ({((avatars[avatarSelected?.ID.toString() || ""]?.sp_value / avatars[avatarSelected?.ID.toString() || ""]?.sp_max) * 100).toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-0.5">
                                        <input
                                            type="range"
                                            min="0"
                                            max={avatars[avatarSelected?.ID.toString() || ""]?.sp_max}
                                            value={avatars[avatarSelected?.ID.toString() || ""]?.sp_value}
                                            onChange={(e) => {
                                                if (!avatars[avatarSelected?.ID.toString() || ""]?.can_change_sp) return
                                                const newSpValue = Math.min(avatars[avatarSelected?.ID.toString() || ""]?.sp_max, Math.max(0, parseInt(e.target.value) || 0));
                                                setAvatars({ ...avatars, [avatarSelected?.ID.toString() || ""]: { ...avatars[avatarSelected?.ID.toString() || ""], sp_value: newSpValue } });
                                            }}
                                            className="range range-warning range-sm flex-1"
                                        />
                                        <button
                                            className="btn btn-sm btn-warning btn-outline h-8 min-h-8 font-bold px-3 rounded-lg shadow-xs active-press"
                                            onClick={() => {
                                                if (!avatars[avatarSelected?.ID.toString() || ""]?.can_change_sp) return
                                                const newSpValue = Math.ceil(avatars[avatarSelected?.ID.toString() || ""]?.sp_max / 2);
                                                const newAvatar = { ...avatars[avatarSelected?.ID.toString() || ""], sp_value: newSpValue }
                                                setAvatar(newAvatar)
                                            }}
                                        >
                                            {transI18n("setTo50")}
                                        </button>
                                    </div>
                                </div>

                                {/* Technique Toggle */}
                                <div className="py-4 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="text-sm font-bold text-base-content tracking-tight flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                            {transI18n("useTechnique")}
                                        </span>
                                        <p className="text-xs text-base-content/70 font-medium pl-3">{transI18n("techniqueNote")}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={avatars[avatarSelected?.ID.toString() || ""]?.techniques.length > 0}
                                        onChange={(e) => {
                                            if (!avatarSelected || avatarSelected?.MazeBuff?.length == 0) return
                                             const techniques = e.target.checked ? avatarSelected?.MazeBuff : [];
                                            const newAvatar = { ...avatars[avatarSelected?.ID.toString() || ""], techniques: techniques };
                                            setAvatar(newAvatar);
                                        }}
                                        className="toggle toggle-primary"
                                    />
                                </div>

                                {/* Enhancement Selection */}
                                {avatarSelected?.Enhanced && (
                                    <div className="py-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-base-content tracking-tight flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                {transI18n("enhancement")}
                                            </span>
                                            <span className="text-xs font-mono text-secondary font-bold">
                                                {avatars[avatarSelected?.ID.toString() || ""]?.enhanced || transI18n("origin")}
                                            </span>
                                        </div>
                                        <select
                                            value={avatars[avatarSelected?.ID.toString() || ""]?.enhanced || ""}
                                            onChange={(e) => {
                                                const newAvatar = avatars[avatarSelected?.ID.toString() || ""]
                                                if (newAvatar) {
                                                    newAvatar.enhanced = e.target.value
                                                    const skillTree = getSkillTree(avatarSelected, e.target.value)
                                                    if (skillTree) {
                                                        newAvatar.data.skills = skillTree
                                                    }
                                                    setAvatar(newAvatar)
                                                }
                                            }}
                                            className="select select-sm select-bordered w-full rounded-xl bg-base-200/50"
                                        >
                                            <option value="">{transI18n("origin")}</option>
                                            {Object.keys(avatarSelected?.Enhanced || {}).map((key) => (
                                                <option key={key} value={key}>
                                                    {key}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-base-content/60 font-medium">{transI18n("enhancedNote")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Lightcone Equipment */}
                    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-base-content/10 shadow-xs flex flex-col justify-between">
                        <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between pb-4 mb-2 border-b border-base-content/10">
                                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2.5">
                                    <div className="w-1.5 h-5 bg-linear-to-b from-secondary to-primary rounded-full"></div>
                                    <span className="bg-clip-text text-transparent bg-linear-to-r from-secondary to-primary font-bold tracking-tight">
                                        {transI18n("lightconeEquipment")}
                                    </span>
                                </h2>
                                {lightcone && (
                                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
                                        S{lightcone.rank} • Lv.{lightcone.level}
                                    </span>
                                )}
                            </div>

                            {lightcone && lightconeDetail ? (
                                <div className="space-y-4">
                                    {/* Lightcone Hero Block */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                        {/* Artwork */}
                                        <div className="sm:col-span-4 aspect-[3/4] rounded-xl overflow-hidden bg-base-200/60 flex items-center justify-center border border-base-content/10 shadow-xs">
                                            <Image
                                                unoptimized
                                                crossOrigin="anonymous"
                                                width={904}
                                                height={1260}
                                                priority
                                                src={`${process.env.CDN_URL}/${lightconeDetail?.Image?.ImagePath}`}
                                                className="w-full h-full object-cover"
                                                alt="Lightcone"
                                            />
                                        </div>

                                        {/* Meta & Stats */}
                                        <div className="sm:col-span-8 space-y-3">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold tracking-tight text-base-content">
                                                    <ParseText
                                                        locale={locale}
                                                        text={getLocaleName(locale, lightconeDetail.Name)}
                                                    />
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-base-200 font-semibold text-base-content/80 border border-base-content/10">
                                                        {transI18n(lightconeDetail.BaseType.toLowerCase())}
                                                    </span>
                                                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold border border-amber-500/25">
                                                        {calcRarity(lightconeDetail.Rarity)}★
                                                    </span>
                                                    <span className="text-xs font-mono text-base-content/60 font-medium">#{lightcone.item_id}</span>
                                                </div>
                                            </div>

                                            {/* Level Slider */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-base-content/80">{transI18n("level")}</span>
                                                    <span className="font-mono text-primary font-bold">{lightcone.level}/80</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="80"
                                                    value={lightcone.level || 1}
                                                    onChange={(e) => {
                                                        const newLightconeLevel = Math.min(80, Math.max(1, parseInt(e.target.value) || 1))
                                                        handleUpdateLightcone((lc) => lc ? { ...lc, level: newLightconeLevel, promotion: calcPromotion(newLightconeLevel) } : null)
                                                    }}
                                                    className="range range-primary range-sm w-full"
                                                />
                                            </div>

                                            {/* Superimposition Rank (S1-S5) */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-base-content/80">{transI18n("superimpositionRank")}</span>
                                                    <span className="font-mono text-info font-bold">S{lightcone.rank}</span>
                                                </div>
                                                <div className="grid grid-cols-5 gap-1.5">
                                                    {[1, 2, 3, 4, 5].map((r) => (
                                                        <button
                                                            key={r}
                                                            onClick={() => {
                                                                handleUpdateLightcone((lc) => lc ? { ...lc, rank: r } : null)
                                                            }}
                                                            className={`btn btn-xs rounded-lg font-mono font-bold transition-all ${
                                                                lightcone.rank === r
                                                                    ? 'btn-primary shadow-xs'
                                                                    : 'btn-ghost bg-base-200 hover:bg-base-300 text-base-content/80'
                                                            }`}
                                                        >
                                                            S{r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skill Description */}
                                    <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-content/10">
                                        <div
                                            className="text-xs sm:text-sm text-base-content/90 leading-relaxed font-normal"
                                            dangerouslySetInnerHTML={{
                                                __html: replaceByParam(
                                                    getLocaleName(locale, lightconeDetail.Skills.Desc),
                                                    lightconeDetail.Skills.Level[lightcone.rank.toString()]?.Param || []
                                                )
                                            }}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                if (avatarSelected) {
                                                    setResetDataLightcone(avatarSelected, baseType)
                                                    handleShow("action_detail_modal")
                                                }
                                            }}
                                            className="btn btn-primary btn-sm flex-1 rounded-xl font-bold shadow-xs"
                                        >
                                            {transI18n("changeLightcone")}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleUpdateLightcone(() => null)
                                            }}
                                            className="btn btn-error btn-outline hover:btn-error btn-sm rounded-xl font-bold px-3.5 gap-1.5 transition-all"
                                            title={transI18n("removeLightcone")}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span className="text-xs">{transI18n("removeLightcone")}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Empty Lightcone State */
                                <div className="text-center py-8 space-y-3.5">
                                    <div
                                        onClick={() => handleShow("action_detail_modal")}
                                        className="w-16 h-16 mx-auto bg-base-200/70 rounded-2xl border-2 border-dashed border-base-content/30 flex items-center justify-center cursor-pointer hover:border-primary hover:scale-105 transition-all group"
                                    >
                                        <svg className="w-7 h-7 text-base-content/50 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-base-content">{transI18n("noLightconeEquipped")}</h3>
                                        <p className="text-xs text-base-content/60 font-medium mt-0.5">{transI18n("equipLightconeNote")}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (avatarSelected) {
                                                setResetDataLightcone(avatarSelected, baseType)
                                                handleShow("action_detail_modal")
                                            }
                                        }}
                                        className="btn btn-primary btn-sm rounded-xl font-bold px-6 shadow-xs"
                                    >
                                        {transI18n("equipLightcone")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightcone Selection Modal */}
            <dialog id="action_detail_modal" className="modal">
                <div className="modal-box w-11/12 max-w-[92vw] sm:max-w-[88vw] max-h-[90vh] bg-base-100 text-base-content border border-white/10 shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-base-content/10 bg-base-100">
                        <h3 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-secondary">
                            {transI18n("lightconeEquipment")}
                        </h3>
                        <button
                            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                            onClick={() => handleCloseModal("action_detail_modal")}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                        <LightconeBar />
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => handleCloseModal("action_detail_modal")}>close</button>
                </form>
            </dialog>
        </div>
    );
}

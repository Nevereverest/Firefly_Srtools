"use client"
import { replaceByParam, getLocaleName } from '@/helper';
import Image from "next/image";
import ParseText from "../parseText";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import useCurrentDataStore from "@/stores/currentDataStore";
import ExtraEffectList from '../extraInfo';
import { useShallow } from "zustand/react/shallow";

export default function EidolonsInfo() {
    const { avatarSelected } = useCurrentDataStore(
        useShallow((state) => ({ avatarSelected: state.avatarSelected }))
    )
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    )
    const transI18n = useTranslations("DataPage")
    const { setAvatars, avatars } = useUserDataStore(
        useShallow((state) => ({
            setAvatars: state.setAvatars,
            avatars: state.avatars,
        }))
    )

    const charRank = useMemo(() => {
        if (!avatarSelected) return null;
        const avatar = avatars[avatarSelected.ID];
        if (avatar?.enhanced != "") {
            return avatarSelected?.Enhanced?.[avatar?.enhanced]?.Ranks
        }
        return avatarSelected?.Ranks
    }, [avatarSelected, avatars]);

    const charExRanks = useMemo(() => {
        if (!avatarSelected) return null;
        const avatar = avatars[avatarSelected.ID];
        if (avatar?.enhanced != "") {
            const enhanced = avatarSelected?.Enhanced?.[avatar?.enhanced];
            if (enhanced?.ExRanks && Object.keys(enhanced.ExRanks).length > 0) {
                return enhanced.ExRanks;
            }
        }
        if (avatarSelected?.ExRanks && Object.keys(avatarSelected.ExRanks).length > 0) {
            return avatarSelected.ExRanks;
        }
        return null;
    }, [avatarSelected, avatars]);

    const currentRank = avatars[avatarSelected?.ID.toString() || ""]?.data?.rank || 0;
    const currentExRankList = avatars[avatarSelected?.ID.toString() || ""]?.data?.ex_rank_id_list || [];

    const handleToggleRank = (rankNum: number) => {
        if (!avatarSelected) return;
        let newRank = rankNum;
        if (currentRank === rankNum) {
            newRank = rankNum - 1;
        }
        setAvatars({
            ...avatars,
            [avatarSelected.ID]: {
                ...avatars[avatarSelected.ID],
                data: {
                    ...avatars[avatarSelected.ID]?.data,
                    rank: newRank,
                },
            },
        });
    };

    const handleToggleExRank = (exRankId: number) => {
        if (!avatarSelected) return;
        const avatarData = avatars[avatarSelected.ID];
        const currentList = avatarData?.data?.ex_rank_id_list || [];
        let newList: number[];
        if (currentList.includes(exRankId)) {
            newList = currentList.filter((id) => id !== exRankId);
        } else {
            newList = [...currentList, exRankId];
        }
        setAvatars({
            ...avatars,
            [avatarSelected.ID]: {
                ...avatars[avatarSelected.ID],
                data: {
                    ...avatars[avatarSelected.ID]?.data,
                    ex_rank_id_list: newList,
                },
            },
        });
    };

    return (
        <div className="w-full">
            <div className="bg-base-100 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-base-300">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                        <div className="w-1.5 h-5 bg-linear-to-b from-primary to-accent rounded-full"></div>
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent font-bold tracking-tight">
                            {transI18n("eidolons")}
                        </span>
                    </h2>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-base-200 border border-base-300 text-xs font-mono font-bold">
                        <span className="text-base-content/60">Active:</span>
                        <span className="text-primary text-sm font-extrabold">E{currentRank}</span>
                        {currentExRankList.length > 0 && (
                            <span className="text-accent text-sm font-extrabold">+EX{currentExRankList.length}</span>
                        )}
                    </div>
                </div>

                {charExRanks && avatars[avatarSelected?.ID || ""] && (
                    <div
                        className={`grid grid-cols-1 ${
                            Object.keys(charExRanks).length > 1 ? "lg:grid-cols-2" : ""
                        } gap-4 pb-6 border-b border-base-300/60`}
                    >
                        {Object.entries(charExRanks || {}).map(([key, exRank]) => {
                            const exRankId = Number(key);
                            const isUnlocked = currentExRankList.includes(exRankId);
                            return (
                                <div
                                    key={key}
                                    className={`group relative flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                                        isUnlocked
                                            ? "bg-accent/4 border-accent/40 shadow-xs"
                                            : "bg-base-200/40 border-base-300/70 hover:border-base-300"
                                    }`}
                                >
                    
                                    <button
                                        type="button"
                                        onClick={() => handleToggleExRank(exRankId)}
                                        aria-pressed={isUnlocked}
                                        title={`Click to ${isUnlocked ? "deactivate" : "activate"}`}
                                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center border ${
                                            isUnlocked
                                                ? "bg-[#161324] border-accent/60 shadow-[0_0_15px_rgba(var(--color-accent),0.25)]"
                                                : "bg-[#12141c] border-white/10 opacity-50 grayscale hover:opacity-80"
                                        }`}
                                    >
                                        <Image
                                            className={`w-full h-full object-contain p-2.5 transition-all duration-300 ${
                                                isUnlocked
                                                    ? "scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                                    : ""
                                            }`}
                                            src={`${process.env.CDN_URL}/${exRank.Image.toLowerCase()}`}
                                            alt=""
                                            priority
                                            unoptimized
                                            crossOrigin="anonymous"
                                            width={80}
                                            height={80}
                                        />
                                    </button>

            
                                    <div className="flex-1 min-w-0 w-full space-y-1.5">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div
                                                onClick={() => handleToggleExRank(exRankId)}
                                                className="flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <span
                                                    className={`font-mono text-sm sm:text-base font-extrabold transition-colors ${
                                                        isUnlocked ? "text-accent" : "text-base-content/40"
                                                    }`}
                                                >
                                                    EX.
                                                </span>
                                                <ParseText
                                                    locale={locale}
                                                    text={getLocaleName(locale, exRank.Name)}
                                                    className={`font-bold text-sm sm:text-base transition-colors ${
                                                        isUnlocked
                                                            ? "text-base-content"
                                                            : "text-base-content/60 group-hover:text-base-content"
                                                    }`}
                                                />
                                                {exRank.Tag && (
                                                    <span
                                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-colors ${
                                                            isUnlocked
                                                                ? "bg-accent/10 text-accent border-accent/30"
                                                                : "bg-base-300/50 text-base-content/40 border-transparent"
                                                        }`}
                                                    >
                                                        {getLocaleName(locale, exRank.Tag)}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleExRank(exRankId)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all select-none ${
                                                    isUnlocked
                                                        ? "bg-accent/15 text-accent border border-accent/30"
                                                        : "bg-base-300/60 text-base-content/40 hover:text-base-content/70 border border-transparent"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        isUnlocked ? "bg-accent" : "bg-base-content/30"
                                                    }`}
                                                />
                                                {isUnlocked ? transI18n("active") : transI18n("inactive")}
                                            </button>
                                        </div>

                                        <div
                                            className={`text-xs sm:text-sm leading-relaxed select-text transition-colors ${
                                                isUnlocked ? "text-base-content/85" : "text-base-content/50"
                                            }`}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: replaceByParam(
                                                        getLocaleName(locale, exRank.Desc),
                                                        exRank.Param
                                                    ),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 6 Eidolons Organic Grid */}
                {charRank && avatars[avatarSelected?.ID || ""] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {Object.entries(charRank || {}).map(([key, rank]) => {
                            const rankNum = Number(rank.Rank);
                            const isUnlocked = rankNum <= currentRank;
                            return (
                                <div
                                    key={key}
                                    className="flex flex-col items-center text-center space-y-3 p-2"
                                >
                                    {/* 1. Organic Floating Eidolon Shard (No artificial rectangle wrapper) */}
                                    <div
                                        onClick={() => handleToggleRank(rankNum)}
                                        className="cursor-pointer select-none transition-transform duration-200 hover:scale-105 active:scale-95"
                                        title={`Click to ${isUnlocked ? 'deactivate' : 'activate'} E${rank.Rank}`}
                                    >
                                        <Image
                                            className={`w-44 sm:w-52 h-auto object-contain drop-shadow-md transition-all duration-300 ${
                                                isUnlocked
                                                    ? "drop-shadow-[0_0_12px_rgba(var(--color-primary),0.35)]"
                                                    : "grayscale opacity-40 hover:opacity-70"
                                            }`}
                                            src={`${process.env.CDN_URL}/ui/ui3d/rank/_dependencies/textures/${avatarSelected?.ID}/${avatarSelected?.ID}_rank_${rank.Rank}.png`}
                                            alt={`Rank ${rank.Rank} Image`}
                                            priority
                                            unoptimized
                                            crossOrigin="anonymous"
                                            width={240}
                                            height={240}
                                        />
                                    </div>

                                    {/* 2. Eidolon Name & Rank */}
                                    <div
                                        onClick={() => handleToggleRank(rankNum)}
                                        className="flex items-center justify-center gap-1.5 cursor-pointer group select-none"
                                    >
                                        <span className={`text-base font-extrabold font-mono ${
                                            isUnlocked ? "text-primary" : "text-base-content/50"
                                        }`}>
                                            E{rank.Rank}.
                                        </span>
                                        <ParseText
                                            locale={locale}
                                            text={getLocaleName(locale, rank.Name)}
                                            className="font-bold text-base text-base-content group-hover:text-primary transition-colors"
                                        />
                                    </div>

                                    {/* 3. Description & Extra Effects (Direct readable text, fully selectable & copyable) */}
                                    <div className="w-full text-left text-xs sm:text-sm text-base-content/85 leading-relaxed space-y-2 select-text pt-1 border-t border-base-300/60">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: replaceByParam(getLocaleName(locale, rank.Desc), rank.Param),
                                            }}
                                        />
                                        <ExtraEffectList extras={rank?.Extra} locale={locale} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

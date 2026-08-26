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

    const currentRank = avatars[avatarSelected?.ID.toString() || ""]?.data?.rank || 0;

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
                    </div>
                </div>

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

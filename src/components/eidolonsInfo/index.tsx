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


export default function EidolonsInfo() {
    const { avatarSelected } = useCurrentDataStore()
    const { locale } = useLocaleStore()
    const transI18n = useTranslations("DataPage")
    const { setAvatars, avatars } = useUserDataStore()

    const charRank = useMemo(() => {
        if (!avatarSelected) return null;
        const avatar = avatars[avatarSelected.ID];
        if (avatar?.enhanced != "") {
            return avatarSelected?.Enhanced?.[avatar?.enhanced]?.Ranks
        }
        return avatarSelected?.Ranks
    }, [avatarSelected, avatars]);

    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6 text-base-content">
                <div className="w-2 h-6 bg-linear-to-b from-primary to-primary/50 rounded-full"></div>
                {transI18n("eidolons")}
            </h2>
            <div className="grid grid-cols-1 m-4 p-4 font-bold gap-4 w-fit max-h-[77vh] min-h-[50vh] overflow-y-scroll overflow-x-hidden">
                {charRank && avatars[avatarSelected?.ID || ""] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(charRank || {}).map(([key, rank]) => (
                            <div key={key}
                                className="flex flex-col items-center"

                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        let newRank = Number(rank.Rank)
                                        if (avatars[avatarSelected?.ID || ""]?.data?.rank == Number(rank.Rank)) {
                                            newRank = Number(rank.Rank) - 1
                                        }
                                        setAvatars({ ...avatars, [avatarSelected?.ID || ""]: { ...avatars[avatarSelected?.ID || ""], data: { ...avatars[avatarSelected?.ID || ""].data, rank: newRank } } })
                                    }}
                                >
                                    <Image
                                        className={`w-60 object-contain mb-2 ${Number(rank.Rank) <= avatars[avatarSelected?.ID.toString() || ""]?.data?.rank ? "" : "grayscale"}`}
                                        src={`${process.env.CDN_URL}/ui/ui3d/rank/_dependencies/textures/${avatarSelected?.ID}/${avatarSelected?.ID}_Rank_${rank.Rank}.png`}
                                        alt={`Rank ${rank.Rank} Image`}
                                        priority
                                        unoptimized
                                        crossOrigin="anonymous"
                                        width={240}
                                        height={240}
                                    />

                                    <div className="text-lg pb-1 flex items-center justify-items-center gap-2">
                                        <span className="inline-block text-indigo-500">{rank.Rank}.</span>
                                        <ParseText
                                            locale={locale}
                                            text={getLocaleName(locale, rank.Name)}
                                            className="text-center text-base font-normal leading-tight"
                                        />
                                    </div>
                                </div>

                                <div className="text-sm font-normal">
                                    <div dangerouslySetInnerHTML={{ __html: replaceByParam(getLocaleName(locale, rank.Desc), rank.Param) }} />
                                    <ExtraEffectList extras={rank?.Extra} locale={locale} />
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}

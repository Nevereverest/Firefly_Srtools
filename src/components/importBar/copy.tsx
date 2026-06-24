"use client"
import useUserDataStore from "@/stores/userDataStore";
import { useState, useMemo } from "react";
import useCopyProfileStore from "@/stores/copyProfile";
import ProfileCard from "../card/profileCard";
import { AvatarProfileCardType, AvatarProfileStore } from "@/types";
import Image from "next/image";
import { getNameChar, calcRarity } from "@/helper";
import useLocaleStore from "@/stores/localeStore";
import { useTranslations } from "next-intl";
import SelectCustomImage from "../select/customSelectImage";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";

export default function CopyImport() {
    const { avatars, setAvatar } = useUserDataStore();
    const { avatarSelected } = useCurrentDataStore()
    const { mapAvatar, baseType, damageType } = useDetailDataStore()
    const { locale } = useLocaleStore()
    const {
        selectedProfiles,
        avatarCopySelected,
        setSelectedProfiles,
        setAvatarCopySelected,
        listElement,
        listPath,
        listRank,
        setListElement,
        setListPath,
        setListRank
    } = useCopyProfileStore()
    const transI18n = useTranslations("DataPage")

    const [message, setMessage] = useState({
        type: "",
        text: ""
    })

    const listAvatar = useMemo(() => {
        if (!mapAvatar || !locale || !transI18n) return []
        let list = Object.values(mapAvatar);
        const allElementFalse = !Object.values(listElement).some(v => v)
        const allPathFalse = !Object.values(listPath).some(v => v)
        const allRarityFalse = !Object.values(listRank).some(v => v)
        list = list.filter(item => (allElementFalse || listElement[item.DamageType]) && (allPathFalse || listPath[item.BaseType]) && (allRarityFalse || listRank[calcRarity(item.Rarity)]))
        list.sort((a, b) => {
            const r = calcRarity(b.Rarity) - calcRarity(a.Rarity)
            if (r !== 0) return r
            return a.ID - b.ID
        })
        return list
    }, [mapAvatar, listElement, listPath, listRank, locale, transI18n])
    

    const handleProfileToggle = (profile: AvatarProfileCardType) => {
        if (selectedProfiles.some((selectedProfile) => selectedProfile.key === profile.key)) {
            setSelectedProfiles(selectedProfiles.filter((selectedProfile) => selectedProfile.key !== profile.key));
            return;
        }
        setSelectedProfiles([...selectedProfiles, profile]);
    };


    const clearSelection = () => {
        setSelectedProfiles([]);
        setMessage({
            type: "success",
            text: transI18n("clearAll")
        })
    };

    const selectAll = () => {
        if (avatarCopySelected) {
            const sourceAvatar = avatars[avatarCopySelected.ID.toString()]
            const sourceProfiles = sourceAvatar?.profileList ?? []

            setSelectedProfiles(sourceProfiles.map((profile, index) => {
                if (!profile.lightcone?.item_id && Object.keys(profile.relics ?? {}).length == 0) {
                    return null;
                }
                return {
                    key: index,
                    ...profile,
                } as AvatarProfileCardType
            }).filter((profile) => profile !== null));
        }
        setMessage({
            type: "success",
            text: transI18n("selectAll")
        })
    };

    const handleCopy = () => {
        if (selectedProfiles.length === 0) {
            setMessage({
                type: "error",
                text: transI18n("pleaseSelectAtLeastOneProfile")
            });
            return;
        }
        if (!avatarCopySelected) {
            setMessage({
                type: "error",
                text: transI18n("noAvatarToCopySelected")
            });
            return;
        }
        if (!avatarSelected) {
            setMessage({
                type: "error",
                text: transI18n("noAvatarSelected")
            });
            return;
        }

        const sourceAvatar = avatars[avatarCopySelected.ID.toString()]
        const targetAvatar = avatars[avatarSelected.ID.toString()]

        if (!sourceAvatar || !targetAvatar) {
            setMessage({
                type: "error",
                text: transI18n("noDataToImport")
            });
            return;
        }

        const selectedKeys = new Set(selectedProfiles.map((profile) => profile.key))
        const newListProfile = sourceAvatar.profileList.map((profile, index) => {
            if (!selectedKeys.has(index) || (!profile.lightcone?.item_id && Object.keys(profile.relics ?? {}).length == 0)) {
                return null;
            }
            return {
                ...profile,
                profile_name: profile.profile_name + ` - Copy: ${avatarCopySelected?.ID}`,
            } as AvatarProfileStore
        }).filter((profile) => profile !== null);

        const newAvatar = {
            ...targetAvatar,
            profileList: targetAvatar.profileList.concat(newListProfile),
            profileSelect: targetAvatar.profileList.length + newListProfile.length - 1,
        }
        setAvatar(newAvatar);
        setSelectedProfiles([]);
        setMessage({
            type: "success",
            text: transI18n("copied")
        });
    };

    return (
        <div className="rounded-lg px-2 min-h-[60vh]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-2">

                    <div className="mt-2 w-full">

                        <div className="flex items-start flex-col gap-2 mt-2 w-full">
                            <div>{transI18n("filter")}</div>
                            <div className="flex flex-wrap justify-start gap-5 md:gap-10 mt-2 w-full">
                                {/* Path */}
                                <div>
                                    <div className="flex flex-wrap gap-2 justify-start items-center">
                                        {Object.entries(baseType).filter(([key]) => key !== "").map(([key, value]) => (
                                            <div
                                                key={key}
                                                onClick={() => {
                                                    setListPath({ ...listPath, [key]: !listPath[key] })
                                                }}
                                                className="w-12.5 h-12.5 hover:bg-gray-600 grid items-center justify-items-center rounded-md shadow-md cursor-pointer"
                                                style={{
                                                    backgroundColor: listPath[key] ? "#374151" : "#6B7280"
                                                }}>
                                                <Image
                                                    unoptimized
                                                    crossOrigin="anonymous"
                                                    src={`${process.env.CDN_URL}/${value.Icon}`}
                                                    alt={key}
                                                    className="h-8 w-8 object-contain rounded-md"
                                                    width={200}
                                                    height={200}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Element */}
                                <div>
                                    <div className="flex flex-wrap gap-2 justify-start items-center">
                                        {Object.entries(damageType).filter(([key]) => key !== "").map(([key, value]) => (
                                            <div
                                                key={key}
                                                onClick={() => {
                                                    setListElement({ ...listElement, [key]: !listElement[key] })
                                                }}
                                                className="w-12.5 h-12.5 hover:bg-gray-600 grid items-center justify-items-center rounded-md shadow-md cursor-pointer"
                                                style={{
                                                    backgroundColor: listElement[key] ? "#374151" : "#6B7280"
                                                }}>
                                                <Image
                                                    unoptimized
                                                    crossOrigin="anonymous"
                                                    src={`${process.env.CDN_URL}/${value.Icon}`}
                                                    alt={key}
                                                    className="h-7 w-7 2xl:h-10 2xl:w-10 object-contain rounded-md"
                                                    width={200}
                                                    height={200}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rank */}
                                <div>
                                    <div className="flex flex-wrap gap-2 justify-end items-center">
                                        {Object.entries(listRank).map(([key], index) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    setListRank({ ...listRank, [key]: !listRank[key] })
                                                }}
                                                className="w-12.5 h-12.5 hover:bg-gray-600 grid items-center justify-items-center rounded-md shadow-md cursor-pointer"
                                                style={{
                                                    backgroundColor: listRank[key] ? "#374151" : "#6B7280"
                                                }}>
                                                <div className="font-bold text-white h-8 w-8 text-center flex items-center justify-center">{key}*</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="grid grid-cols-1 gap-2">

                            {listAvatar.length > 0 && (
                                <div>
                                    <div>{transI18n("characterName")}</div>
                                    <SelectCustomImage
                                        customSet={listAvatar.map((avatar) => ({
                                            value: avatar.ID.toString(),
                                            label: getNameChar(locale, transI18n, avatar),
                                            imageUrl: `${process.env.CDN_URL}/${avatar.Image.AvatarIconPath}`
                                        }))}
                                        excludeSet={[]}
                                        selectedCustomSet={avatarCopySelected?.ID.toString() || ""}
                                        placeholder="Character Select"
                                        setSelectedCustomSet={(value) => setAvatarCopySelected(mapAvatar[value] || null)}
                                    />
                                </div>
                            )}

                        </div>
                    </div>



                    {/* Selection Info */}
                    <div className="mt-6 flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg">
                        <span className="text-blue-400 font-medium">
                            {transI18n("selectedProfiles")}: {selectedProfiles.length}
                        </span>
                        <button
                            onClick={clearSelection}
                            className="text-error/75 hover:text-error text-sm font-medium px-3 py-1 border border-error/75 rounded hover:bg-error/10 transition-colors cursor-pointer"
                        >
                            {transI18n("clearAll")}
                        </button>
                        <button
                            onClick={selectAll}
                            className="text-primary/75 hover:text-primary text-sm font-medium px-3 py-1 border border-primary/75 rounded hover:bg-primary/10 transition-colors cursor-pointer">
                            {transI18n("selectAll")}
                        </button>
                        {selectedProfiles.length > 0 && (
                            <button
                                onClick={handleCopy}
                                className="text-success/75 hover:text-success text-sm font-medium px-3 py-1 border border-success/75 rounded hover:bg-success/10 transition-colors cursor-pointer">
                                {transI18n("copy")}
                            </button>
                        )}
                    </div>
                    {message.type && message.text && (
                        <div className={(message.type == "error" ? "text-error" : "text-success") + " text-lg mt-2"} >{message.type == "error" ? "😭" : "🎉"} {message.text}</div>
                    )}
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {avatarCopySelected && avatars[avatarCopySelected?.ID.toString()]?.profileList.map((profile, index) => {
                        if (!profile.lightcone?.item_id && Object.keys(profile.relics ?? {}).length == 0) {
                            return null;
                        }
                        return (
                            <ProfileCard
                                key={index}
                                profile={{ ...profile, key: index }}
                                selectedProfile={selectedProfiles}
                                onProfileToggle={handleProfileToggle}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

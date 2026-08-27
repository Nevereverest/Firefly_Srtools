"use client"
import { useState } from "react";
import CharacterInfoCard from "../card/characterInfoCard";
import useEnkaStore from "@/stores/enkaStore";
import { SendDataThroughProxy } from "@/lib/api/api";
import { CharacterInfoCardType, EnkaResponse } from "@/types";
import useUserDataStore from "@/stores/userDataStore";
import { converterOneEnkaDataToAvatarStore } from "@/helper";
import useModelStore from "@/stores/modelStore";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { avatarEnkaDetailSchema, enkaResponseSchema } from "@/zod";
import { z } from "zod";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";

type AvatarEnkaDetailInput = z.infer<typeof avatarEnkaDetailSchema>;

const toCharacterInfoCard = (character: AvatarEnkaDetailInput): CharacterInfoCardType => ({
    key: character.avatarId,
    avatar_id: character.avatarId,
    rank: character.rank ?? 0,
    level: character.level,
    lightcone: {
        level: character.equipment?.level ?? 0,
        rank: character.equipment?.rank ?? 0,
        item_id: character.equipment?.tid ?? 0,
    },
    relics: character.relicList.map((relic) => ({
        level: relic.level,
        relic_id: relic.tid,
        relic_set_id: parseInt(relic.tid.toString().slice(1, -1), 10),
    })),
});

export default function EnkaImport() {
    const {
        uidInput,
        setUidInput,
        enkaData,
        selectedCharacters,
        setSelectedCharacters,
        setEnkaData,
    } = useEnkaStore(
        useShallow((state) => ({
            uidInput: state.uidInput,
            setUidInput: state.setUidInput,
            enkaData: state.enkaData,
            selectedCharacters: state.selectedCharacters,
            setSelectedCharacters: state.setSelectedCharacters,
            setEnkaData: state.setEnkaData,
        }))
    );
    const transI18n = useTranslations("DataPage")
    const { avatars, setAvatar } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            setAvatar: state.setAvatar,
        }))
    );
    const { setIsOpenImport } = useModelStore(
        useShallow((state) => ({
            setIsOpenImport: state.setIsOpenImport,
        }))
    )
    const { mapAvatar } = useDetailDataStore(
        useShallow((state) => ({
            mapAvatar: state.mapAvatar,
        }))
    )
    const [isLoading, setIsLoading] = useState(false)
    const [Error, setError] = useState("")
    const validCharacters = enkaData?.detailInfo.avatarDetailList.filter((character) => mapAvatar?.[character.avatarId]) ?? []

    const handlerFetchData = async () => {
        if (!uidInput) {
            setError(transI18n("pleaseEnterUid"))
            return;
        }
        setIsLoading(true)
        try {
            const data: unknown = await SendDataThroughProxy({data: {serverUrl: "https://enka.network/api/hsr/uid/" + uidInput, method: "GET"}})
            const parsed = enkaResponseSchema.safeParse(data)

            if (!parsed.success) {
                setEnkaData(null)
                setSelectedCharacters([])
                setError(transI18n("failedToFetchEnkaData"))
                return
            }

            setEnkaData(parsed.data as EnkaResponse)
            setSelectedCharacters(parsed.data.detailInfo.avatarDetailList.filter((character) => mapAvatar?.[character.avatarId]).map(toCharacterInfoCard))
            setError("")
        } catch {
            setEnkaData(null)
            setSelectedCharacters([])
            setError(transI18n("failedToFetchEnkaData"))
        } finally {
            setIsLoading(false)
        }
    }

    const handleCharacterToggle = (character: CharacterInfoCardType) => {
        if (selectedCharacters.some((selectedCharacter) => selectedCharacter.key === character.key)) {
            setSelectedCharacters(selectedCharacters.filter((selectedCharacter) => selectedCharacter.key !== character.key));
            return;
        }
        setSelectedCharacters([...selectedCharacters, character]);
    };

    const clearSelection = () => {
        setSelectedCharacters([]);
    };

    const selectAll = () => {
        if (enkaData) {
            setSelectedCharacters(validCharacters.map(toCharacterInfoCard));
        }
    };

    const handleImport = () => {
        if (selectedCharacters.length === 0) {
            setError(transI18n("pleaseSelectAtLeastOneCharacter"));
            return;
        }
        if (!enkaData) {
            setError(transI18n("noDataToImport"));
            return;
        }
        setError("");
        const listAvatars = { ...avatars }
        const parsed = enkaResponseSchema.safeParse(enkaData)
        if (!parsed.success) {
            setError(transI18n("failedToFetchEnkaData"));
            return;
        }

        const filterData = parsed.data.detailInfo.avatarDetailList.filter((character) => mapAvatar?.[character.avatarId] && selectedCharacters.some((selectedCharacter) => selectedCharacter.avatar_id === character.avatarId))
        filterData.forEach((character) => {
            const currentAvatar = listAvatars[character.avatarId.toString()]
            if (currentAvatar && Object.keys(currentAvatar).length !== 0) {
                const newProfileList = [...(currentAvatar.profileList || [])]
                const newProfile = converterOneEnkaDataToAvatarStore(character, newProfileList.length)
                if (newProfile) {
                    newProfileList.push(newProfile)
                }
                const newAvatar = {
                    ...currentAvatar,
                    level: character.level ?? 0,
                    promotion: character.promotion ?? 0,
                    data: {
                        rank: character.rank ?? 0,
                        skills: character.skillTreeList.reduce((acc, skill) => {
                            acc[skill.pointId] = skill.level;
                            return acc;
                        }, {} as Record<string, number>),
                    },
                    profileList: newProfileList,
                    profileSelect: newProfile ? newProfileList.length - 1 : currentAvatar.profileSelect,
                }
                setAvatar(newAvatar)
            }
        })
        setIsOpenImport(false)
        toast.success(transI18n("importEnkaDataSuccess"))
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-base-content text-xl sm:text-2xl font-bold">HSR UID</h1>

                <div className="flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        value={uidInput}
                        onChange={(e) => setUidInput(e.target.value)}
                        className="input input-bordered w-full max-w-xs rounded-xl bg-base-200 border-base-300 text-sm focus:border-primary"
                        placeholder="Enter UID"
                    />
                    <button onClick={handlerFetchData} className="btn btn-sm btn-success rounded-xl font-bold">
                        {transI18n("getData")}
                    </button>
                    {selectedCharacters.length > 0 && (
                        <button onClick={handleImport} className="btn btn-sm btn-primary rounded-xl font-bold shadow-xs">
                            {transI18n("import")}
                        </button>
                    )}
                </div>
                {Error && (
                    <div className="text-error text-sm font-semibold mt-2">😭 {Error}</div>
                )}

                {/* Player Info */}
                {enkaData && (
                    <div className="bg-base-200 p-4 rounded-xl border border-base-300 text-base-content space-y-1">
                        <div className="text-sm font-semibold">Name: <span className="font-bold text-primary">{enkaData.detailInfo.nickname}</span></div>
                        <div className="text-sm font-semibold">UID: <span className="font-mono">{enkaData.detailInfo.uid}</span></div>
                        <div className="text-sm font-semibold">Level: <span className="font-bold">{enkaData.detailInfo.level}</span></div>
                    </div>
                )}

                {/* Selection Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-base-200 border border-base-300 p-3.5 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-base-content">
                            {transI18n("selectedCharacters")}:
                        </span>
                        <span className="badge badge-primary font-mono font-bold text-xs">
                            {selectedCharacters.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearSelection}
                            className="btn btn-xs sm:btn-sm btn-ghost text-error hover:bg-error/10 border border-error/30 rounded-xl"
                        >
                            {transI18n("clearAll")}
                        </button>
                        <button
                            onClick={selectAll}
                            className="btn btn-xs sm:btn-sm btn-ghost text-primary hover:bg-primary/10 border border-primary/30 rounded-xl"
                        >
                            {transI18n("selectAll")}
                        </button>
                    </div>
                </div>
            </div>
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            )}
            {/* Character Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {validCharacters.map((character) => (
                    <CharacterInfoCard
                        key={character.avatarId}
                        character={toCharacterInfoCard(character)}
                        selectedCharacters={selectedCharacters}
                        onCharacterToggle={handleCharacterToggle}
                    />
                ))}
            </div>
        </div>
    );
}

"use client"

import useFreeSRStore from "@/stores/freesrStore";
import useModelStore from "@/stores/modelStore";
import useUserDataStore from "@/stores/userDataStore";
import { CharacterInfoCardType } from "@/types";
import { useState } from "react";
import CharacterInfoCard from "../card/characterInfoCard";
import { freeSrJsonSchema } from "@/zod";
import { toast } from "react-toastify";
import { converterOneFreeSRDataToAvatarStore } from "@/helper";
import { useTranslations } from "next-intl";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";
import { z } from "zod";

type FreeSRJsonInput = z.infer<typeof freeSrJsonSchema>;

const toCharacterInfoCard = (data: FreeSRJsonInput, character: FreeSRJsonInput["avatars"][string]): CharacterInfoCardType => {
    const lightcone = data.lightcones.find((lightcone) => lightcone.equip_avatar === character.avatar_id)
    const relics = data.relics.filter((relic) => relic.equip_avatar === character.avatar_id)

    return {
        key: character.avatar_id,
        avatar_id: character.avatar_id,
        rank: character.data.rank ?? 0,
        level: character.level,
        lightcone: {
            level: lightcone?.level ?? 0,
            rank: lightcone?.rank ?? 0,
            item_id: lightcone?.item_id ?? 0,
        },
        relics: relics.map((relic) => ({
            level: relic.level,
            relic_id: relic.relic_id,
            relic_set_id: relic.relic_set_id,
        })),
    }
}

export default function FreeSRImport() {
    const { avatars, setAvatar } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            setAvatar: state.setAvatar,
        }))
    );
    const { mapAvatar } = useDetailDataStore(
        useShallow((state) => ({
            mapAvatar: state.mapAvatar,
        }))
    );
    const { setIsOpenImport } = useModelStore(
        useShallow((state) => ({
            setIsOpenImport: state.setIsOpenImport,
        }))
    )
    const [isLoading, setIsLoading] = useState(false)
    const [Error, setError] = useState("")
    const { freeSRData, setFreeSRData, selectedCharacters, setSelectedCharacters } = useFreeSRStore(
        useShallow((state) => ({
            freeSRData: state.freeSRData,
            setFreeSRData: state.setFreeSRData,
            selectedCharacters: state.selectedCharacters,
            setSelectedCharacters: state.setSelectedCharacters,
        }))
    )
    const transI18n = useTranslations("DataPage")
    const parsedFreeSRData = freeSrJsonSchema.safeParse(freeSRData)
    const validFreeSRData = parsedFreeSRData.success ? parsedFreeSRData.data : null

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
        const parsed = freeSrJsonSchema.safeParse(freeSRData)
        if (parsed.success) {
            setSelectedCharacters(Object.values(parsed.data.avatars).filter(it => mapAvatar?.[it.avatar_id]).map((character) => toCharacterInfoCard(parsed.data, character)));
        }
    };

    const handlerReadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true)
        const file = event.target.files?.[0];
        if (!file) {
            setSelectedCharacters([])
            setFreeSRData(null)
            setError(transI18n("pleaseSelectAFile"))
            setIsLoading(false)
            return
        }
        if (!file.name.endsWith(".json") || file.type !== "application/json") {
            setSelectedCharacters([])
            setFreeSRData(null)
            setError(transI18n("fileMustBeAValidJsonFile"))
            setIsLoading(false)
            return
        }

        if (file) {

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    const parsed = freeSrJsonSchema.safeParse(data)
                    if (!parsed.success) {
                        setSelectedCharacters([])
                        setFreeSRData(null)
                        setError(transI18n("fileMustBeAValidJsonFile"))
                        return
                    }

                    setFreeSRData(parsed.data)
                    setError("")

                    setSelectedCharacters(Object.values(parsed.data.avatars).filter(it => mapAvatar?.[it.avatar_id]).map((character) => toCharacterInfoCard(parsed.data, character)));
                } catch {

                    setSelectedCharacters([])
                    setFreeSRData(null)
                    setError(transI18n("fileMustBeAValidJsonFile"))
                } finally {
                    setIsLoading(false)
                }
            };
            reader.onerror = () => {
                setSelectedCharacters([])
                setFreeSRData(null)
                setError(transI18n("fileMustBeAValidJsonFile"))
                setIsLoading(false)
            }
            reader.readAsText(file);
        }
    };

    const handleImport = () => {
        if (selectedCharacters.length === 0) {
            setError(transI18n("pleaseSelectAtLeastOneCharacter"));
            return;
        }
        if (!freeSRData) {
            setError(transI18n("noDataToImport"));
            return;
        }
        setError("");

        const parsed = freeSrJsonSchema.safeParse(freeSRData)
        if (!parsed.success) {
            setError(transI18n("fileMustBeAValidJsonFile"));
            return;
        }

        const listAvatars = { ...avatars }
        const filterData = Object.values(parsed.data.avatars).filter((character) => selectedCharacters.some((selectedCharacter) => selectedCharacter.avatar_id === character.avatar_id))
        filterData.forEach((character) => {
            const currentAvatar = listAvatars[character.avatar_id]
            if (currentAvatar && Object.keys(currentAvatar).length !== 0) {
                const newProfileList = [...(currentAvatar.profileList || [])]
                const newProfile = converterOneFreeSRDataToAvatarStore(parsed.data, newProfileList.length, character.avatar_id)
                if (newProfile) {
                    newProfileList.push(newProfile)
                }
                const newAvatar = {
                    ...currentAvatar,
                    level: character.level,
                    promotion: character.promotion,
                    data: {
                        rank: character.data.rank ?? 0,
                        skills: character.data.skills
                    },
                    profileList: newProfileList,
                    profileSelect: newProfile ? newProfileList.length - 1 : currentAvatar.profileSelect,
                }
                setAvatar(newAvatar)
            }
        })
        setIsOpenImport(false)
        toast.success(transI18n("importFreeSRDataSuccess"))
    }

    return (
        <div className="bg-base-100 p-4 sm:p-6 rounded-2xl">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-base-content text-xl sm:text-2xl font-bold">{transI18n("freeSRImport")}</h1>

                    <div className="flex flex-wrap gap-4 items-center">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-xs font-semibold">{transI18n("pickAFile")}</legend>
                            <input type="file" accept=".json" className="file-input file-input-sm file-input-bordered rounded-xl" onChange={handlerReadFile} />
                            <label className="label text-[11px] text-base-content/60">{transI18n("onlySupportFreeSRJsonFile")}</label>
                        </fieldset>

                        {selectedCharacters.length > 0 && (
                            <button onClick={handleImport} className="btn btn-sm btn-primary rounded-xl font-bold shadow-xs">
                                {transI18n("import")}
                            </button>
                        )}
                    </div>
                    {Error && (
                        <div className="text-error text-sm font-semibold mt-2">😭 {Error}</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {validFreeSRData && Object.values(validFreeSRData.avatars).filter(it => mapAvatar?.[it.avatar_id]).map((character) => {
                        return (
                            <CharacterInfoCard
                                key={character.avatar_id}
                                character={toCharacterInfoCard(validFreeSRData, character)}
                                selectedCharacters={selectedCharacters}
                                onCharacterToggle={handleCharacterToggle}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

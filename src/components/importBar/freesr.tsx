"use client"

import useFreeSRStore from "@/stores/freesrStore";
import useModelStore from "@/stores/modelStore";
import useUserDataStore from "@/stores/userDataStore";
import { CharacterInfoCardType } from "@/types";
import { useState, useRef } from "react";
import CharacterInfoCard from "../card/characterInfoCard";
import { freeSrJsonSchema } from "@/zod";
import { toast } from "react-toastify";
import { converterOneFreeSRDataToAvatarStore } from "@/helper";
import { useTranslations } from "next-intl";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";
import { z } from "zod";
import { 
    UploadCloud, 
    FileJson, 
    CheckCheck, 
    RotateCcw, 
    AlertCircle, 
    ArrowRight,
    Users,
    FileCheck
} from "lucide-react";

type FreeSRJsonInput = z.infer<typeof freeSrJsonSchema>;

const toCharacterInfoCard = (data: FreeSRJsonInput, character: FreeSRJsonInput["avatars"][string]): CharacterInfoCardType => {
    const lightcone = data.lightcones?.find((lc) => lc.equip_avatar === character.avatar_id);
    const relics = data.relics?.filter((relic) => relic.equip_avatar === character.avatar_id) || [];

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
    };
};

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
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { freeSRData, setFreeSRData, selectedCharacters, setSelectedCharacters } = useFreeSRStore(
        useShallow((state) => ({
            freeSRData: state.freeSRData,
            setFreeSRData: state.setFreeSRData,
            selectedCharacters: state.selectedCharacters,
            setSelectedCharacters: state.setSelectedCharacters,
        }))
    );

    const transI18n = useTranslations("DataPage");
    const parsedFreeSRData = freeSrJsonSchema.safeParse(freeSRData);
    const validFreeSRData = parsedFreeSRData.success ? parsedFreeSRData.data : null;

    const availableCharacters = validFreeSRData 
        ? Object.values(validFreeSRData.avatars).filter(it => mapAvatar?.[it.avatar_id])
        : [];

    const handleCharacterToggle = (character: CharacterInfoCardType) => {
        if (selectedCharacters.some((selected) => selected.key === character.key)) {
            setSelectedCharacters(selectedCharacters.filter((selected) => selected.key !== character.key));
            return;
        }
        setSelectedCharacters([...selectedCharacters, character]);
    };

    const clearSelection = () => {
        setSelectedCharacters([]);
    };

    const selectAll = () => {
        if (validFreeSRData) {
            setSelectedCharacters(availableCharacters.map((char) => toCharacterInfoCard(validFreeSRData, char)));
        }
    };

    const processFile = (file: File) => {
        setIsLoading(true);
        if (!file.name.endsWith(".json") && file.type !== "application/json") {
            setSelectedCharacters([]);
            setFreeSRData(null);
            setFileName(null);
            setErrorMsg(transI18n("fileMustBeAValidJsonFile"));
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const raw = JSON.parse(e.target?.result as string);
                const parsed = freeSrJsonSchema.safeParse(raw);
                if (!parsed.success) {
                    setSelectedCharacters([]);
                    setFreeSRData(null);
                    setFileName(null);
                    setErrorMsg(transI18n("fileMustBeAValidJsonFile"));
                    return;
                }

                setFreeSRData(parsed.data);
                setFileName(file.name);
                setErrorMsg("");

                const validChars = Object.values(parsed.data.avatars)
                    .filter(it => mapAvatar?.[it.avatar_id])
                    .map((char) => toCharacterInfoCard(parsed.data, char));
                setSelectedCharacters(validChars);
            } catch {
                setSelectedCharacters([]);
                setFreeSRData(null);
                setFileName(null);
                setErrorMsg(transI18n("fileMustBeAValidJsonFile"));
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setSelectedCharacters([]);
            setFreeSRData(null);
            setFileName(null);
            setErrorMsg(transI18n("fileMustBeAValidJsonFile"));
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleImport = () => {
        if (selectedCharacters.length === 0) {
            setErrorMsg(transI18n("pleaseSelectAtLeastOneCharacter"));
            return;
        }
        if (!freeSRData) {
            setErrorMsg(transI18n("noDataToImport"));
            return;
        }
        setErrorMsg("");

        const parsed = freeSrJsonSchema.safeParse(freeSRData);
        if (!parsed.success) {
            setErrorMsg(transI18n("fileMustBeAValidJsonFile"));
            return;
        }

        const listAvatars = { ...avatars };
        const filterData = Object.values(parsed.data.avatars).filter((character) => 
            selectedCharacters.some((selected) => selected.avatar_id === character.avatar_id)
        );

        filterData.forEach((character) => {
            const currentAvatar = listAvatars[character.avatar_id];
            if (currentAvatar && Object.keys(currentAvatar).length !== 0) {
                const newProfileList = [...(currentAvatar.profileList || [])];
                const newProfile = converterOneFreeSRDataToAvatarStore(parsed.data, newProfileList.length, character.avatar_id);
                if (newProfile) {
                    newProfileList.push(newProfile);
                }
                const newAvatar = {
                    ...currentAvatar,
                    level: character.level,
                    promotion: character.promotion,
                    data: {
                        rank: character.data.rank ?? 0,
                        skills: character.data.skills,
                        ex_rank_id_list: character.data?.ex_rank_id_list?.length ? character.data.ex_rank_id_list : undefined
                    },
                    profileList: newProfileList,
                    profileSelect: newProfile ? newProfileList.length - 1 : currentAvatar.profileSelect,
                };
                setAvatar(newAvatar);
            }
        });

        setIsOpenImport(false);
        toast.success(transI18n("importFreeSRDataSuccess"));
    };

    return (
        <div className="w-full space-y-6">
            {/* Top Bar: Title & Upload Trigger */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md bg-primary/15 text-primary border border-primary/25">
                            FreeSR Protocol
                        </span>
                        <span className="text-xs text-base-content/50 font-medium">JSON Importer</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
                        {transI18n("freeSRImport")}
                    </h2>
                </div>

                {/* File Dropzone / Active File Badge */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".json,application/json" 
                    className="hidden" 
                    onChange={handleFileChange} 
                />

                {!validFreeSRData ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all duration-200 select-none w-full sm:w-auto ${
                            isDragging 
                                ? 'bg-primary/15 border-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb,6,182,212),0.3)] scale-[1.02]' 
                                : 'bg-base-200/50 hover:bg-base-200/80 border-white/20 hover:border-primary/50'
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UploadCloud className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-base-content flex items-center gap-1.5">
                                {transI18n("pickAFile")}
                                <span className="text-[10px] font-normal text-base-content/60">(.json)</span>
                            </p>
                            <p className="text-[11px] text-base-content/50 truncate max-w-50">
                                {transI18n("onlySupportFreeSRJsonFile")}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                        <div className="flex items-center justify-between sm:justify-start gap-2 h-10 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate max-w-45 font-mono text-xs">{fileName || "data.json"}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                                {availableCharacters.length} {transI18n("avatars")}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 px-3.5 rounded-xl font-semibold text-xs bg-base-200 hover:bg-base-300 text-base-content border border-base-content/15 transition-all flex items-center justify-center cursor-pointer"
                        >
                            {transI18n("changeFile")}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Floating Selection & Actions Bar */}
            {validFreeSRData && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-base-200/60 backdrop-blur-md border border-white/10 shadow-xs">
                    {/* Left: Counter and Quick Select */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs sm:text-sm font-bold text-base-content">
                                {transI18n("selectedCharacters")}:
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-xs">
                                {selectedCharacters.length} / {availableCharacters.length}
                            </span>
                        </div>

                        <div className="h-4 w-px bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                {transI18n("selectAll")}
                            </button>
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {transI18n("clearAll")}
                            </button>
                        </div>
                    </div>

                    {/* Right: Import CTA */}
                    <button 
                        type="button"
                        onClick={handleImport}
                        disabled={selectedCharacters.length === 0}
                        className="h-9 px-5 rounded-xl font-bold text-xs sm:text-sm bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto cursor-pointer"
                    >
                        <span className="text-white">{transI18n("import")}</span>
                        <span className="font-mono text-xs text-cyan-100">({selectedCharacters.length})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>
            )}

            {/* Loading Shimmer State */}
            {isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 py-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl bg-base-200/30 border border-white/5 animate-pulse p-3.5 space-y-3">
                            <div className="w-full aspect-4/5 rounded-xl bg-base-300/40" />
                            <div className="h-4 bg-base-300/60 rounded w-2/3 mx-auto" />
                            <div className="h-3 bg-base-300/40 rounded w-1/2 mx-auto" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State (when no valid data is loaded) */}
            {!isLoading && !validFreeSRData && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 rounded-2xl border border-dashed border-white/15 bg-base-200/20 hover:bg-base-200/40 transition-all duration-300 text-center cursor-pointer group select-none"
                >
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-primary/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />

                    <div className="relative z-10 max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-base-300/60 border border-white/10 text-primary mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-primary/40 transition-all duration-300">
                            <FileJson className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-base sm:text-lg font-bold text-base-content">
                                {transI18n("noFreeSRDataLoaded")}
                            </h3>
                            <p className="text-xs text-base-content/60 leading-relaxed">
                                {transI18n("dropFreeSRJsonHint")}
                            </p>
                        </div>

                        {/* Step hints */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 text-left border-t border-white/5">
                            <div className="p-3 rounded-xl bg-base-300/30">
                                <span className="text-[10px] font-bold text-primary block mb-0.5">{transI18n("step1")}</span>
                                <p className="text-[11px] text-base-content/70 leading-tight">{transI18n("exportJsonFromFreeSR")}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-base-300/30">
                                <span className="text-[10px] font-bold text-primary block mb-0.5">{transI18n("step2")}</span>
                                <p className="text-[11px] text-base-content/70 leading-tight">{transI18n("dropOrSelectFile")}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-base-300/30">
                                <span className="text-[10px] font-bold text-primary block mb-0.5">{transI18n("step3")}</span>
                                <p className="text-[11px] text-base-content/70 leading-tight">{transI18n("syncCharacterBuilds")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Character Grid */}
            {!isLoading && validFreeSRData && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {availableCharacters.map((character) => (
                        <CharacterInfoCard
                            key={character.avatar_id}
                            character={toCharacterInfoCard(validFreeSRData, character)}
                            selectedCharacters={selectedCharacters}
                            onCharacterToggle={handleCharacterToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


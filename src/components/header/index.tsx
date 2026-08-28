/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { downloadJson } from "@/helper";
import { converterToFreeSRJson } from "@/helper/converterToFreeSRJson";
import { useChangeTheme } from "@/hooks/useChangeTheme";
import { listCurrentLanguage, listCurrentLanguageApi } from "@/constant/constant";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EnkaImport from "../importBar/enka";
import useModelStore from "@/stores/modelStore";
import FreeSRImport from "../importBar/freesr";
import { toast } from "react-toastify";
import { micsSchema } from "@/zod";
import useGlobalStore from "@/stores/globalStore";
import MonsterBar from "../monsterBar";
import Image from "next/image";
import ConnectBar from "../connectBar";
import ExtraSettingBar from "../extraSettingBar";
import ChangelogBar from "../changelog";
import { ModalConfig } from "@/types";
import { ScrollText } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

const themes = [
    { label: "Winter" },
    { label: "Night" },
    { label: "Cupcake" },
    { label: "Coffee" },
];

function setCookieLocale(localeVal: string) {
    if (typeof document !== "undefined") {
        document.cookie = `MYNEXTAPP_LOCALE=${localeVal}; path=/; max-age=31536000;`;
    }
}

export default function Header() {
    const { changeTheme } = useChangeTheme()
    const { locale, setLocale } = useLocaleStore(
        useShallow((state) => ({
            locale: state.locale,
            setLocale: state.setLocale,
        }))
    )
    const {
        avatars,
        battle_type,
        setAvatars,
        setBattleType,
        moc_config,
        pf_config,
        as_config,
        ce_config,
        peak_config,
        setMocConfig,
        setPfConfig,
        setAsConfig,
        setCeConfig,
        setPeakConfig,
    } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            battle_type: state.battle_type,
            setAvatars: state.setAvatars,
            setBattleType: state.setBattleType,
            moc_config: state.moc_config,
            pf_config: state.pf_config,
            as_config: state.as_config,
            ce_config: state.ce_config,
            peak_config: state.peak_config,
            setMocConfig: state.setMocConfig,
            setPfConfig: state.setPfConfig,
            setAsConfig: state.setAsConfig,
            setCeConfig: state.setCeConfig,
            setPeakConfig: state.setPeakConfig,
        }))
    )

    const router = useRouter()
    const transI18n = useTranslations("DataPage")
    const {
        setIsOpenImport,
        isOpenImport,
        setIsOpenMonster,
        isOpenMonster,
        setIsOpenConnect,
        isOpenConnect,
        setIsOpenExtra,
        isOpenExtra,
        setIsChangelog,
        isChangelog
    } = useModelStore(
        useShallow((state) => ({
            setIsOpenImport: state.setIsOpenImport,
            isOpenImport: state.isOpenImport,
            setIsOpenMonster: state.setIsOpenMonster,
            isOpenMonster: state.isOpenMonster,
            setIsOpenConnect: state.setIsOpenConnect,
            isOpenConnect: state.isOpenConnect,
            setIsOpenExtra: state.setIsOpenExtra,
            isOpenExtra: state.isOpenExtra,
            setIsChangelog: state.setIsChangelog,
            isChangelog: state.isChangelog,
        }))
    )

    const [importModal, setImportModal] = useState("enka");

    const { isConnectPS, extraData } = useGlobalStore(
        useShallow((state) => ({
            isConnectPS: state.isConnectPS,
            extraData: state.extraData,
        }))
    )

    useEffect(() => {

        const cookieLocale = document.cookie.split("; ")
            .find((row) => row.startsWith("MYNEXTAPP_LOCALE"))
            ?.split("=")[1];

        if (cookieLocale) {
            if (!listCurrentLanguageApi.hasOwnProperty(cookieLocale)) {
                setLocale("en")
                document.cookie = "MYNEXTAPP_LOCALE=en;"
                router.refresh()
            } else {
                setLocale(cookieLocale)
            }

        } else {
            let browserLocale = navigator.language.slice(0, 2);

            if (!listCurrentLanguageApi.hasOwnProperty(browserLocale)) {
                browserLocale = "en"
            }
            setLocale(browserLocale);
            document.cookie = `MYNEXTAPP_LOCALE=${browserLocale};`
            router.refresh()
        }
    }, [router, setLocale])

    const changeLocale = (newLocale: string) => {
        setLocale(newLocale)
        setCookieLocale(newLocale)
        router.refresh()
    }

    const handleShow = (modalId: string) => {
        const modal = document.getElementById(modalId) as HTMLDialogElement | null;
        if (modal) {
            modal.showModal();
        }
    };

    // Close modal handler
    const handleCloseModal = (modalId: string) => {
        const modal = document.getElementById(modalId) as HTMLDialogElement | null;
        if (modal) {
            modal.close()
        }
    };

    const modalConfigs: ModalConfig[] = [
        {
            id: "connect_modal",
            title: transI18n("psConnection"),
            isOpen: isOpenConnect,
            onClose: () => {
                setIsOpenConnect(false)
                handleCloseModal("connect_modal")
            },
            content: <ConnectBar />
        },
        {
            id: "import_modal",
            title: transI18n("importSetting"),
            isOpen: isOpenImport,
            onClose: () => {
                setIsOpenImport(false)
                handleCloseModal("import_modal")
            },
            content: (
                <>
                    {importModal === "enka" && <EnkaImport />}
                    {importModal === "freesr" && <FreeSRImport />}
                </>
            )
        },
        {
            id: "monster_modal",
            title: transI18n("monsterSetting"),
            isOpen: isOpenMonster,
            onClose: () => {
                setIsOpenMonster(false)
                handleCloseModal("monster_modal")
            },
            content: <MonsterBar />
        },
        {
            id: "extra_modal",
            title: transI18n("extraSetting"),
            isOpen: isOpenExtra,
            onClose: () => {
                setIsOpenExtra(false)
                handleCloseModal("extra_modal")
            },
            content: <ExtraSettingBar />
        },
        {
            id: "changelog_modal",
            title: "Changelog",
            isOpen: isChangelog,
            onClose: () => {
                setIsChangelog(false)
                handleCloseModal("changelog_modal")
            },
            content: <ChangelogBar />
        }
    ]

    // Handle ESC key to close modal
    useEffect(() => {
        for (const item of modalConfigs) {
            if (!item?.isOpen) {
                handleCloseModal(item?.id || "")
            } else {
                handleShow(item?.id || "")
            }
        }
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                for (const item of modalConfigs) {
                    handleCloseModal(item?.id || "")
                }
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpenImport, isOpenMonster, isOpenConnect, isOpenExtra, isChangelog]);

    const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0];
        if (!file) {
            toast.error(transI18n("pleaseSelectAFile"))
            return
        }
        if (!file.name.endsWith(".json") || file.type !== "application/json") {
            toast.error(transI18n("fileMustBeAValidJsonFile"))
            return
        }

        if (file) {

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    const parsed = micsSchema.parse(data)
                    setAvatars(parsed.avatars)
                    setBattleType(parsed.battle_type)
                    setMocConfig(parsed.moc_config)
                    setPfConfig(parsed.pf_config)
                    setAsConfig(parsed.as_config)
                    setCeConfig(parsed.ce_config)
                    setPeakConfig(parsed.peak_config)
                    toast.success(transI18n("importDatabaseSuccess"))
                } catch {
                    toast.error(transI18n("fileMustBeAValidJsonFile"))
                }
            };
            reader.readAsText(file);
        }

    };

    return (
        <header className="sticky top-0 z-40 w-full shrink-0 bg-base-100 border-b border-base-300 shadow-xs">
            <div className="navbar max-w-[1920px] mx-auto px-2 sm:px-4 py-1.5 min-h-14">
                <div className="navbar-start gap-2">
                    {/* Mobile menu dropdown */}
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm lg:hidden rounded-lg hover:bg-base-200 transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-56 p-2 shadow-2xl border border-base-content/15"
                        >
                            <li>
                                <details>
                                    <summary className="px-3 py-2 hover:bg-base-200/70 rounded-lg transition-all duration-200 font-medium w-full">{transI18n("loadData")}</summary>
                                    <ul className="p-2 space-y-1">
                                        <li><a className="rounded-md" onClick={() => {
                                            setImportModal("freesr")
                                            setIsOpenImport(true)
                                        }}>{transI18n("freeSr")}</a></li>
                                        <li>
                                            <>
                                                <input
                                                    type="file"
                                                    accept="application/json"
                                                    id="database-data-upload"
                                                    className="hidden"
                                                    onChange={handleImportDatabase}
                                                />
                                                <button
                                                    className="rounded-md w-full text-left"
                                                    onClick={() => document.getElementById('database-data-upload')?.click()}
                                                >
                                                    {transI18n("database")}
                                                </button>
                                            </>
                                        </li>
                                        <li><a className="rounded-md" onClick={() => {
                                            setImportModal("enka")
                                            setIsOpenImport(true)
                                        }}>{transI18n("enka")}</a></li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary className="px-3 py-2 hover:bg-base-200/70 rounded-lg transition-all duration-200 font-medium">{transI18n("exportData")}</summary>
                                    <ul className="p-2 space-y-1">
                                        <li><a className="rounded-md" onClick={() => downloadJson("freesr-data",
                                            converterToFreeSRJson(
                                                avatars,
                                                battle_type,
                                                moc_config,
                                                pf_config,
                                                as_config,
                                                ce_config,
                                                peak_config
                                            )
                                        )}>{transI18n("freeSr")}</a></li>
                                        <li><a className="rounded-md" onClick={() => downloadJson("database-data", {
                                            avatars: avatars,
                                            battle_type: battle_type,
                                            moc_config: moc_config,
                                            pf_config: pf_config,
                                            as_config: as_config,
                                            ce_config: ce_config,
                                            peak_config: peak_config
                                        })}>{transI18n("database")}</a></li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <button
                                    className="px-3 py-2 hover:bg-base-200/70 rounded-lg transition-all duration-200 font-medium"
                                    onClick={() => {
                                        setIsOpenConnect(true)
                                    }}
                                >
                                    {transI18n("connectSetting")}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        setIsOpenMonster(true)
                                    }}
                                    className="px-3 py-2 hover:bg-base-200/70 rounded-lg transition-all duration-200 font-medium"
                                >
                                    {transI18n("monsterSetting")}
                                </button>
                            </li>

                            {extraData && (
                                <li>
                                    <button
                                        onClick={() => {
                                            setIsOpenExtra(true)
                                        }}
                                        className="px-3 py-2 hover:bg-base-200/70 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        {transI18n("extraSetting")}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Brand Logo */}
                    <a className="flex items-center gap-2.5 px-2 group cursor-pointer select-none">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-linear-to-r from-emerald-500/20 to-orange-500/20 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Image
                                unoptimized
                                crossOrigin="anonymous"
                                src="/ff-srtool.png"
                                alt="Logo"
                                width={250}
                                height={250}
                                className="relative w-9 h-9 xl:w-10 xl:h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col justify-center items-start">
                            <h1 className="text-base xl:text-lg font-bold leading-tight tracking-tight flex items-center gap-1">
                                <span className="text-primary font-extrabold">Firefly</span>
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-amber-400 to-rose-400">
                                    SrTools
                                </span>
                            </h1>
                            <p className="text-[11px] text-base-content/50 font-medium tracking-wide uppercase">Firefly Shelter</p>
                        </div>
                    </a>
                </div>

                {/* Desktop navigation */}
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal gap-1.5 p-0 text-sm font-medium">
                        <li>
                            <details>
                                <summary className="px-3 py-1.5 hover:bg-base-200/70 rounded-lg transition-all duration-200">{transI18n("loadData")}</summary>
                                <ul className="p-2 bg-base-100 rounded-xl shadow-xl border border-base-content/15 space-y-1 w-44 z-50">
                                    <li><a className="rounded-md" onClick={() => {
                                        setImportModal("freesr")
                                        setIsOpenImport(true)
                                    }}>{transI18n("freeSr")}</a></li>
                                    <li>
                                        <>
                                            <input
                                                type="file"
                                                accept="application/json"
                                                id="database-data-upload"
                                                className="hidden"
                                                onChange={handleImportDatabase}
                                            />
                                            <button
                                                className="rounded-md w-full text-left"
                                                onClick={() => document.getElementById('database-data-upload')?.click()}
                                            >
                                                {transI18n("database")}
                                            </button>
                                        </>
                                    </li>
                                    <li><a className="rounded-md" onClick={() => {
                                        setImportModal("enka")
                                        setIsOpenImport(true)
                                    }}>{transI18n("enka")}</a></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary className="px-3 py-1.5 hover:bg-base-200/70 rounded-lg transition-all duration-200">{transI18n("exportData")}</summary>
                                <ul className="p-2 bg-base-100 rounded-xl shadow-xl border border-base-content/15 space-y-1 w-44 z-50">
                                    <li><a className="rounded-md" onClick={() => downloadJson("freesr-data",
                                        converterToFreeSRJson(
                                            avatars,
                                            battle_type,
                                            moc_config,
                                            pf_config,
                                            as_config,
                                            ce_config,
                                            peak_config
                                        )
                                    )}>{transI18n("freeSr")}</a></li>
                                    <li><a className="rounded-md" onClick={() => downloadJson("database-data", {
                                        avatars: avatars,
                                        battle_type: battle_type,
                                        moc_config: moc_config,
                                        pf_config: pf_config,
                                        as_config: as_config,
                                        ce_config: ce_config,
                                        peak_config: peak_config
                                    })}>{transI18n("database")}</a></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <button
                                className="px-3 py-1.5 hover:bg-base-200/70 rounded-lg transition-all duration-200"
                                onClick={() => {
                                    setIsOpenConnect(true)
                                }}
                            >
                                {transI18n("connectSetting")}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setIsOpenMonster(true)
                                }}
                                className="px-3 py-1.5 hover:bg-base-200/70 rounded-lg transition-all duration-200"
                            >
                                {transI18n("monsterSetting")}
                            </button>
                        </li>
                        {extraData && (
                            <li>
                                <button
                                    onClick={() => {
                                        setIsOpenExtra(true)
                                    }}
                                    className="px-3 py-1.5 hover:bg-base-200/70 rounded-lg transition-all duration-200"
                                >
                                    {transI18n("extraSetting")}
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Right side items */}
                <div className="navbar-end gap-2 pr-1">
                    {/* PS Connection Status Badge */}
                    <div data-tip={isConnectPS ? "Connected to PS" : "Not Connected"} className="tooltip tooltip-bottom">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-base-200/60 border border-white/5 shadow-xs">
                            <span className="relative flex h-2 w-2">
                                {isConnectPS && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnectPS ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`}></span>
                            </span>
                            <span className={`hidden xl:block text-xs font-semibold tracking-tight ${isConnectPS ? 'text-emerald-500' : 'text-base-content/50'}`}>
                                {isConnectPS ? transI18n("connected") : transI18n("unconnected")}
                            </span>
                        </div>
                    </div>

                    {/* View Logs Button */}
                    <button
                        data-tip="Changelog"
                        title="Changelog"
                        className="btn btn-ghost btn-sm btn-circle tooltip tooltip-bottom text-warning/90 hover:bg-warning/10 transition-colors"
                        onClick={() => {
                            setIsChangelog(true)
                        }}
                    >
                        <ScrollText className="w-4 h-4" />
                    </button>

                    {/* Language selector */}
                    <div className="dropdown dropdown-end tooltip tooltip-bottom" data-tip={transI18n("language") || "Language"}>
                        <div
                            tabIndex={0}
                            role="button"
                            className="flex items-center gap-1.5 border border-base-content/10 bg-base-200/40 rounded-lg text-xs px-2.5 py-1 hover:bg-base-200/80 transition-all duration-200 font-semibold uppercase tracking-wider"
                        >
                            <span className="font-bold">{listCurrentLanguage[locale as keyof typeof listCurrentLanguage]?.flag || "EN"}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5 opacity-60">
                                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <ul
                            tabIndex={0}
                            className="dropdown-content z-50 menu p-1.5 shadow-2xl bg-base-100 rounded-xl w-48 mt-2 border border-base-content/15 space-y-0.5"
                        >
                            {Object.entries(listCurrentLanguage).map(([key, value]) => (
                                <li key={key}>
                                    <button
                                        className={`flex justify-between rounded-lg py-1.5 text-xs font-medium ${locale === key ? "active bg-primary/20 text-primary font-bold" : "hover:bg-base-200/70"}`}
                                        onClick={() => {
                                            changeLocale(key);
                                            const elem = document.activeElement;
                                            if (elem instanceof HTMLElement) {
                                                elem.blur();
                                            }
                                        }}
                                    >
                                        <span className="font-bold">{value.flag}</span>
                                        <span>{value.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Theme selector */}
                    <div className="dropdown dropdown-end tooltip tooltip-bottom" data-tip="Theme">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-lg hover:bg-base-200/70 transition-all duration-200 px-2" title="Theme">
                            <svg
                                width={16}
                                height={16}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="h-4 w-4 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                />
                            </svg>
                        </div>

                        <div
                            tabIndex={0}
                            className="dropdown-content bg-base-100 text-base-content rounded-xl overflow-hidden border border-base-content/15 shadow-2xl mt-2 z-50"
                        >
                            <ul className="menu w-36 p-1.5 space-y-0.5">
                                {themes.map((theme) => (
                                    <li
                                        key={theme.label}
                                        onClick={() => {
                                            if (changeTheme) changeTheme(theme.label.toLowerCase());
                                        }}
                                    >
                                        <button
                                            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-base-200/70 rounded-lg text-xs font-medium transition-all duration-200"
                                            data-set-theme={theme.label.toLowerCase()}
                                        >
                                            <div
                                                data-theme={theme.label.toLowerCase()}
                                                className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded p-1 shadow-xs border border-white/10"
                                            >
                                                <div className="bg-base-content size-1 rounded-full" />
                                                <div className="bg-primary size-1 rounded-full" />
                                                <div className="bg-secondary size-1 rounded-full" />
                                                <div className="bg-accent size-1 rounded-full" />
                                            </div>
                                            <span>{theme.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modalConfigs?.map(({ id, title, onClose, content }) => (
                <dialog key={id} id={id} className="modal">
                    <div className={`modal-box w-11/12 ${
                        id === 'monster_modal' || id === 'import_modal' || id === 'extra_modal'
                            ? 'max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] 2xl:max-w-375 h-[88vh]' 
                            : id === 'connect_modal'
                            ? 'max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[88vh]'
                            : id === 'changelog_modal'
                            ? 'max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[85vh]'
                            : 'max-w-[92vw] sm:max-w-[88vw] max-h-[90vh]'
                    } max-h-[90vh] flex flex-col bg-base-100 text-base-content border border-base-content/10 shadow-2xl rounded-2xl p-0 overflow-hidden`}>
                        {/* Modal Header */}
                        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-base-content/10 bg-base-100 shrink-0">
                            <h3 className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-secondary">
                                {title}
                            </h3>
                            <button
                                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                                onClick={onClose}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                            {content}
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={onClose}>close</button>
                    </form>
                </dialog>
            ))}
        </header>
    )
}

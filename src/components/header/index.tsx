/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { downloadJson } from "@/helper";
import { converterToFreeSRJson } from "@/helper/converterToFreeSRJson";
import { useChangeTheme } from "@/hooks/useChangeTheme";
import { listCurrentLanguage, listCurrentLanguageApi } from "@/constant/constant";
import useLocaleStore from "@/stores/localeStore";
import useUserDataStore from "@/stores/userDataStore";
import { motion } from "framer-motion";
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

const themes = [
    { label: "Winter" },
    { label: "Night" },
    { label: "Cupcake" },
    { label: "Coffee" },
];

export default function Header() {
    const { changeTheme } = useChangeTheme()
    const { locale, setLocale } = useLocaleStore()
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
    } = useUserDataStore()

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
    } = useModelStore()

    const [importModal, setImportModal] = useState("enka");

    const { isConnectPS, extraData } = useGlobalStore()

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
        document.cookie = `MYNEXTAPP_LOCALE=${newLocale};`
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
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-3 py-1">
            <div className="navbar-start">
                {/* Mobile menu dropdown */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm lg:hidden hover:bg-base-200 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow-md border border-base-200"
                    >
                        <li>
                            <details>
                                <summary className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium w-full">{transI18n("loadData")}</summary>
                                <ul className="p-2">
                                    <li><a onClick={() => {
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
                                                onClick={() => document.getElementById('database-data-upload')?.click()}
                                            >
                                                {transI18n("database")}
                                            </button>
                                        </>
                                    </li>
                                    <li><a onClick={() => {
                                        setImportModal("enka")
                                        setIsOpenImport(true)
                                    }}>{transI18n("enka")}</a></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium">{transI18n("exportData")}</summary>
                                <ul className="p-2">
                                    <li><a onClick={() => downloadJson("freesr-data",
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
                                    <li><a onClick={() => downloadJson("database-data", {
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
                                className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
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
                                className="disabled px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
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
                                    className="disabled px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
                                >
                                    {transI18n("extraSetting")}
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Logo */}

                <a className="hidden sm:grid sm:grid-cols-1 items-start justify-items-center text-left gap-0 hover:scale-105 px-2">
                    <div className="flex items-center justify-center gap-2">
                        <Image
                            unoptimized
                            crossOrigin="anonymous"
                            src="/ff-srtool.png"
                            alt="Logo"
                            width={250}
                            height={250}
                            className="w-10 h-10 xl:w-12 xl:h-12 object-contain"
                        />
                        <div className="flex flex-col justify-center items-start">
                            <h1 className="text-lg xl:text-xl font-bold leading-tight">
                                <span className="text-emerald-500">Firefly Sr</span>
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-orange-500 to-red-500">
                                    Tools
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500">Firefly Shelter</p>
                        </div>
                    </div>
                </a>

            </div>

            {/* Desktop navigation */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal gap-1">
                    <li>
                        <details>
                            <summary className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium">{transI18n("loadData")}</summary>
                            <ul className="p-2">
                                <li><a onClick={() => {
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
                                            onClick={() => document.getElementById('database-data-upload')?.click()}
                                        >
                                            {transI18n("database")}
                                        </button>
                                    </>
                                </li>
                                <li><a onClick={() => {
                                    setImportModal("enka")
                                    setIsOpenImport(true)
                                }}>{transI18n("enka")}</a></li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details>
                            <summary className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium">{transI18n("exportData")}</summary>
                            <ul className="p-2">
                                <li><a onClick={() => downloadJson("freesr-data",
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
                                <li><a onClick={() => downloadJson("database-data", {
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
                            className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
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
                            className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
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
                                className="px-3 py-2 hover:bg-base-200 rounded-md transition-all duration-200 font-medium"
                            >
                                {transI18n("extraSetting")}
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            {/* Right side items */}
            <div className="navbar-end gap-2 pr-1 ">
                <div data-tip="Connection Status" className="tooltip tooltip-bottom">
                    <div className="flex items-center space-x-2 p-1.5 rounded-full shadow-md">
                        <div className={`hidden xl:block text-sm italic ${isConnectPS ? 'text-green-500' : 'text-red-500'}`}>
                            {isConnectPS ? transI18n("connected") : transI18n("unconnected")}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${isConnectPS ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                </div>

                <div
                    data-tip="View Logs"
                    className="btn btn-ghost btn-sm btn-circle items-center justify-center w-fit tooltip tooltip-bottom"
                    onClick={() => {
                        setIsChangelog(true)
                    }}
                >
                    <ScrollText className="w-5 h-5 text-warning" />
                </div>

                {/* Language selector - REFINED */}
                <div className="dropdown dropdown-end">
                    {/* Nút bấm hiển thị */}
                    <div
                        tabIndex={0}
                        role="button"
                        className="flex items-center gap-1 border border-base-300 rounded text-sm px-2 py-0.5 hover:bg-base-200 transition-all duration-200 uppercase font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                        </svg>

                        {listCurrentLanguage[locale as keyof typeof listCurrentLanguage]?.flag || "EN"}

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 opacity-50">
                            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <ul
                        tabIndex={0}
                        className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
                    >
                        {Object.entries(listCurrentLanguage).map(([key, value]) => (
                            <li key={key}>
                                <button
                                    className={`flex justify-between ${locale === key ? "active" : ""}`}
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
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm hover:bg-base-200 transition-all duration-200 px-2">
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
                        <svg
                            width="10px"
                            height="10px"
                            className="ml-1 h-2 w-2 fill-current opacity-60"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 2048 2048"
                        >
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
                        </svg>
                    </div>

                    <div
                        tabIndex={0}
                        className="dropdown-content bg-base-100 text-base-content rounded-lg top-px overflow-y-auto border border-base-200 shadow-md mt-12"
                    >
                        <ul className="menu w-40 p-1">
                            {themes.map((theme) => (
                                <li
                                    key={theme.label}
                                    onClick={() => {
                                        if (changeTheme) changeTheme(theme.label.toLowerCase());
                                    }}
                                >
                                    <button
                                        className="gap-2 px-2 py-1.5 hover:bg-base-200 rounded text-sm transition-all duration-200"
                                        data-set-theme={theme.label.toLowerCase()}
                                        data-act-class="[&_svg]:visible"
                                    >
                                        <div
                                            data-theme={theme.label.toLowerCase()}
                                            className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded p-1 shadow-sm"
                                        >
                                            <div className="bg-base-content size-1 rounded-full" />
                                            <div className="bg-primary size-1 rounded-full" />
                                            <div className="bg-secondary size-1 rounded-full" />
                                            <div className="bg-accent size-1 rounded-full" />
                                        </div>
                                        <div className="text-sm">{theme.label}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {modalConfigs?.map(({ id, title, onClose, content }) => (
                <dialog key={id} id={id} className="modal">
                    <div className="modal-box w-11/12 max-w-[90%] max-h-[85vh] bg-base-100 text-base-content border border-purple-500/50 shadow-lg shadow-purple-500/20">
                        <div className="sticky top-0 z-10">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                                className="btn btn-circle btn-md absolute right-2 top-2 bg-red-600 hover:bg-red-700 text-white border-none"
                                onClick={onClose}
                            >
                                ✕
                            </motion.button>
                        </div>

                        <div className="border-b border-purple-500/30 px-6 py-4 mb-4">
                            <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-cyan-400">
                                {title}
                            </h3>
                        </div>

                        {content}
                    </div>
                </dialog>
            ))}
        </div>
    )
}

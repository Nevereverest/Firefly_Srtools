/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation'
import ParseText from "../parseText";
import useLocaleStore from "@/stores/localeStore";
import { getNameChar } from "@/helper/getName";
import { useEffect, useMemo, useState } from "react";
import useModelStore from "@/stores/modelStore";
import useUserDataStore from "@/stores/userDataStore";
import { ModalConfig, RelicStore, AvatarProfileStore } from "@/types";
import { toast } from "react-toastify";
import useGlobalStore from "@/stores/globalStore";
import { connectToPS, syncDataToPS } from "@/helper";
import CopyImport from "../importBar/copy";
import useCopyProfileStore from "@/stores/copyProfile";
import AvatarBar from "../avatarBar";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";
import { useShallow } from "zustand/react/shallow";
import { User, Shield, Sparkles, Zap, Image as ImageIcon, RefreshCw, Plus, Copy, Edit2, Trash2 } from "lucide-react";

export default function ActionBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { avatarSelected } = useCurrentDataStore(
    useShallow((state) => ({ avatarSelected: state.avatarSelected }))
  )
  const { damageType, baseType } = useDetailDataStore(
    useShallow((state) => ({
      damageType: state.damageType,
      baseType: state.baseType,
    }))
  )
  const { setResetData } = useCopyProfileStore(
    useShallow((state) => ({ setResetData: state.setResetData }))
  )
  const transI18n = useTranslations("DataPage")
  const { locale } = useLocaleStore(
    useShallow((state) => ({ locale: state.locale }))
  )
  const {
    isOpenCreateProfile,
    setIsOpenCreateProfile,
    isOpenCopy,
    setIsOpenCopy,
    isOpenAvatars,
    setIsOpenAvatars
  } = useModelStore(
    useShallow((state) => ({
      isOpenCreateProfile: state.isOpenCreateProfile,
      setIsOpenCreateProfile: state.setIsOpenCreateProfile,
      isOpenCopy: state.isOpenCopy,
      setIsOpenCopy: state.setIsOpenCopy,
      isOpenAvatars: state.isOpenAvatars,
      setIsOpenAvatars: state.setIsOpenAvatars,
    }))
  )
  const { avatars, setAvatar } = useUserDataStore(
    useShallow((state) => ({
      avatars: state.avatars,
      setAvatar: state.setAvatar,
    }))
  )
  const [profileName, setProfileName] = useState("");
  const [formState, setFormState] = useState("EDIT");
  const [profileEdit, setProfileEdit] = useState(-1);
  const { isConnectPS } = useGlobalStore(
    useShallow((state) => ({ isConnectPS: state.isConnectPS }))
  )

  const profileCurrent = useMemo(() => {
    if (!avatarSelected) return null;
    const avatar = avatars[avatarSelected.ID];
    return avatar?.profileList?.[avatar?.profileSelect] ?? avatar?.profileList?.[0] ?? null;
  }, [avatarSelected, avatars]);

  const listProfile = useMemo(() => {
    if (!avatarSelected) return [];
    const avatar = avatars[avatarSelected.ID];
    return avatar?.profileList || [];
  }, [avatarSelected, avatars]);

  const handleUpdateProfile = () => {
    if (!profileName.trim()) return;
    if (formState === "CREATE" && avatarSelected && avatars[avatarSelected.ID]) {
      const newProfile: AvatarProfileStore = {
        profile_name: profileName,
        lightcone: null,
        relics: {} as Record<string, RelicStore>
      };
      const newListProfile = [...listProfile, newProfile];
      setAvatar({ ...avatars[avatarSelected.ID], profileList: newListProfile, profileSelect: newListProfile.length - 1 })
      toast.success("Profile created successfully")
    } else if (formState === "EDIT" && profileCurrent && avatarSelected && profileEdit !== -1) {
      const newListProfile = listProfile.map((p, idx) =>
        idx === profileEdit ? { ...p, profile_name: profileName } : p
      );
      setAvatar({ ...avatars[avatarSelected.ID], profileList: newListProfile })
      toast.success("Profile updated successfully")
    }
    handleCloseModal("update_profile_modal");
  };

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
      modal.close();
    }
  };

  const actionMove = (path: string) => {
    router.push(`/${path}`)
  }

  const handleProfileSelect = (profileId: number) => {
    if (!avatarSelected || !avatars[avatarSelected.ID]) return;
    if (avatars[avatarSelected.ID].profileSelect === profileId) return;
    setAvatar({ ...avatars[avatarSelected.ID], profileSelect: profileId })
    const selectedProfile = avatars[avatarSelected.ID].profileList?.[profileId];
    if (selectedProfile) {
      toast.success(`Profile changed to: ${selectedProfile.profile_name}`)
    }
  }

  const handleDeleteProfile = (profileId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!avatarSelected || profileId === 0 || !avatars[avatarSelected.ID]) return;
    const targetProfile = avatars[avatarSelected.ID].profileList?.[profileId];
    if (!targetProfile) return;
    if (window.confirm(`Are you sure you want to delete profile: ${targetProfile.profile_name}?`)) {
      const currentSelect = avatars[avatarSelected.ID].profileSelect;
      const newListProfile = listProfile.filter((_, idx) => idx !== profileId);
      const nextSelect = currentSelect >= profileId ? Math.max(0, currentSelect - 1) : currentSelect;
      setAvatar({ ...avatars[avatarSelected.ID], profileList: newListProfile, profileSelect: nextSelect })
      toast.success(`Profile ${targetProfile.profile_name} deleted successfully`)
    }
  }

  const handleConnectOrSyncPS = async () => {
    if (isConnectPS) {
      const res = await syncDataToPS()
      if (res.success) {
        toast.success(transI18n("syncSuccess"))
      } else {
        toast.error(`${transI18n("syncFailed")}: ${res.message}`)
      }
    } else {
      const res = await connectToPS()
      if (res.success) {
        toast.success(transI18n("connectedSuccess"))
      } else {
        toast.error(`${transI18n("connectedFailed")}: ${res.message}`)
      }
    }
  }

  const modalConfigs: ModalConfig[] = [
    {
      id: "update_profile_modal",
      title: formState === "CREATE" ? transI18n("createNewProfile") : transI18n("editProfile"),
      isOpen: isOpenCreateProfile,
      onClose: () => {
        setIsOpenCreateProfile(false)
        handleCloseModal("update_profile_modal")
      },
      content: (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base-content/80">
                {transI18n("profileName")}
              </span>
            </label>
            <input
              type="text"
              placeholder={transI18n("placeholderProfileName")}
              className="input input-bordered input-primary w-full"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-ghost" onClick={() => setIsOpenCreateProfile(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateProfile}>
              {formState === "CREATE" ? transI18n("create") : transI18n("update")}
            </button>
          </div>
        </div>
      )
    },
    {
      id: "copy_profile_modal",
      title: transI18n("copyProfiles"),
      isOpen: isOpenCopy,
      onClose: () => {
        setIsOpenCopy(false)
        handleCloseModal("copy_profile_modal")
      },
      content: <CopyImport />
    },
    {
      id: "avatars_modal",
      title: transI18n("avatars"),
      isOpen: isOpenAvatars,
      onClose: () => {
        setIsOpenAvatars(false)
        handleCloseModal("avatars_modal")
      },
      content: <AvatarBar onClose={() => { setIsOpenAvatars(false); handleCloseModal("avatars_modal") }} />
    }
  ]

  // Handle ESC key to close modal
  useEffect(() => {
    for (const item of modalConfigs) {
      if (!item?.isOpen) {
        handleCloseModal(item?.id || "")
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
  }, [isOpenCopy, isOpenCreateProfile, isOpenAvatars]);

  const navTabs = [
    { label: transI18n("characterInformation"), path: "", icon: User },
    { label: transI18n("relics"), path: "relics-info", icon: Shield },
    { label: transI18n("eidolons"), path: "eidolons-info", icon: Sparkles },
    { label: transI18n("skills"), path: "skills-info", icon: Zap },
    { label: transI18n("showcaseCard"), path: "showcase-card", icon: ImageIcon },
  ];

  const currentActivePath = pathname?.replace(/^\//, '') || "";

  return (
    <div className="w-full bg-transparent px-3 sm:px-4 py-2 space-y-2">
      {/* Top Row: Character Identity + Profile Selector + Connect PS */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Character Identity */}
        {avatarSelected && (
          <div className="flex items-center gap-2 h-8.5 px-3 rounded-xl bg-base-200/80 border border-base-content/10 text-xs sm:text-sm font-semibold shadow-xs">
            <Image
              src={`${process.env.CDN_URL}/${damageType?.[avatarSelected?.DamageType]?.Icon}`}
              alt="damage type"
              unoptimized
              crossOrigin="anonymous"
              className="h-5 w-5 object-contain"
              width={20}
              height={20}
            />
            <span className="text-base-content/85 font-medium">{transI18n(avatarSelected.BaseType.toLowerCase())}</span>
            <span className="text-base-content/30">/</span>
            <ParseText
              locale={locale}
              text={getNameChar(locale, transI18n, avatarSelected).toWellFormed()}
              className="font-bold text-primary"
            />
            <span className="text-[11px] font-mono text-base-content/60 font-semibold">#{avatarSelected.ID}</span>
          </div>
        )}

        {/* Profile Selector & Quick Actions */}
        <div className="flex items-center h-8.5 rounded-xl bg-base-200/80 border border-base-content/10 p-0.5 shadow-xs">
          <div className="dropdown dropdown-bottom dropdown-start h-full flex items-center">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm btn-ghost gap-1.5 h-7 min-h-7 font-bold rounded-lg hover:bg-base-300/80 px-2"
            >
              <span className="text-[11px] uppercase tracking-wider text-base-content/60 font-semibold">{transI18n("profile")}:</span>
              <span className="truncate max-w-28 sm:max-w-40 text-xs text-base-content font-bold">
                {profileCurrent?.profile_name || "Default Profile"}
              </span>
              <svg className="w-3.5 h-3.5 opacity-60 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl min-w-60 mt-2 border border-base-300 max-h-72 overflow-y-auto space-y-1">
              {listProfile.map((profile, index) => (
                <li key={index} className="flex flex-row items-center justify-between rounded-xl px-1 hover:bg-base-200">
                  <button
                    className="flex-1 text-left py-2 px-2 text-xs font-medium truncate"
                    onClick={() => handleProfileSelect(index)}
                  >
                    <span className="truncate">{profile.profile_name}</span>
                    {index === 0 && (
                      <span className="text-[10px] text-base-content/50 ml-1.5 font-mono">({transI18n("default")})</span>
                    )}
                  </button>
                  {index !== 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost btn-xs btn-circle text-warning hover:bg-warning/20"
                        onClick={() => {
                          setFormState("EDIT");
                          setProfileName(profile.profile_name)
                          setProfileEdit(index)
                          setIsOpenCreateProfile(true)
                          handleShow("update_profile_modal")
                        }}
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/20"
                        onClick={(e) => handleDeleteProfile(index, e)}
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </li>
              ))}

              <li className="border-t border-base-300 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsOpenCopy(true)
                    setResetData(baseType, damageType)
                    handleShow("copy_profile_modal")
                  }}
                  className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {transI18n("copyProfiles")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setIsOpenCreateProfile(true)
                    setFormState("CREATE");
                    setProfileName("")
                    handleShow("update_profile_modal")
                  }}
                  className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {transI18n("addNewProfile")}
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex items-center border-l border-base-content/10 pl-1 pr-0.5 gap-0.5 h-5">
            <button
              onClick={() => {
                setIsOpenCopy(true)
                setResetData(baseType, damageType)
                handleShow("copy_profile_modal")
              }}
              className="btn btn-ghost btn-xs btn-circle h-6 w-6 min-h-6 text-base-content/60 hover:text-primary hover:bg-primary/10"
              title={transI18n("copyProfiles")}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsOpenCreateProfile(true)
                setFormState("CREATE");
                setProfileName("")
                handleShow("update_profile_modal")
              }}
              className="btn btn-ghost btn-xs btn-circle h-6 w-6 min-h-6 text-base-content/60 hover:text-primary hover:bg-primary/10"
              title={transI18n("addNewProfile")}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Connect PS Button */}
        <div className="hidden sm:flex items-center gap-2 ml-auto tooltip tooltip-bottom" data-tip={isConnectPS ? transI18n("sync") : transI18n("connectPs")}>
          <button
            onClick={handleConnectOrSyncPS}
            className={`btn btn-sm h-8.5 min-h-8.5 rounded-xl px-3.5 gap-1.5 font-bold shadow-xs whitespace-nowrap active-press ${
              isConnectPS
                ? "btn-outline btn-accent"
                : "btn-primary shadow-sm"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnectPS ? "text-accent" : ""}`} />
            <span className="text-xs">{isConnectPS ? transI18n("sync") : transI18n("connectPs")}</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Action Row (< 640px): [Avatars Button] & [Actions Dropdown] */}
      <div className="grid grid-cols-2 sm:hidden gap-2 w-full pt-1">
        <button
          onClick={() => {
            setIsOpenAvatars(true);
            handleShow("avatars_modal");
          }}
          className="btn btn-warning btn-sm w-full font-bold shadow-xs"
        >
          {transI18n("avatars")}
        </button>

        <div className="dropdown dropdown-end w-full">
          <label tabIndex={0} className="btn btn-info btn-sm w-full font-bold shadow-xs">
            {transI18n("actions")}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 mt-2 border border-base-300 space-y-1"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.path}>
                  <button
                    onClick={() => actionMove(tab.path)}
                    className="flex items-center gap-2 py-2 px-3 text-xs font-semibold"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                </li>
              );
            })}
            <li className="border-t border-base-300 pt-1 mt-1">
              <button
                onClick={handleConnectOrSyncPS}
                className="btn btn-primary btn-sm w-full font-bold mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isConnectPS ? transI18n("sync") : transI18n("connectPs")}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation Tabs Row (>= 640px) */}
      <div className="hidden sm:block w-full bg-base-200/80 border border-base-content/10 rounded-xl p-1 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex sm:grid sm:grid-cols-5 w-full min-w-max gap-1">
          {navTabs.map((tab) => {
            const isActive = currentActivePath === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => actionMove(tab.path)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap active-press ${
                  isActive
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/75 hover:text-base-content hover:bg-base-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Modals */}
        {modalConfigs.map(({ id, title, onClose, content }) => (
          <dialog key={id} id={id} className="modal">
            <div className="modal-box w-11/12 max-w-[92vw] sm:max-w-[88vw] max-h-[90vh] bg-base-100 text-base-content border border-base-300 shadow-2xl rounded-2xl p-0 overflow-hidden">
              <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-100">
                <h3 className="font-bold text-xl tracking-tight text-primary">
                  {title}
                </h3>
                <button
                  className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                {content}
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={onClose}>close</button>
            </form>
          </dialog>
        ))}
      </div>
  );
}
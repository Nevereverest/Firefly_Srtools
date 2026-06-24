/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from 'next/navigation'
import ParseText from "../parseText";
import useLocaleStore from "@/stores/localeStore";
import { getNameChar } from "@/helper/getName";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useModelStore from "@/stores/modelStore";
import useUserDataStore from "@/stores/userDataStore";
import { ModalConfig, RelicStore } from "@/types";
import { toast } from "react-toastify";
import useGlobalStore from "@/stores/globalStore";
import { connectToPS, syncDataToPS } from "@/helper";
import CopyImport from "../importBar/copy";
import useCopyProfileStore from "@/stores/copyProfile";
import AvatarBar from "../avatarBar";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";

export default function ActionBar() {
  const router = useRouter()
  const { avatarSelected } = useCurrentDataStore()
  const { damageType, baseType } = useDetailDataStore()
  const { setResetData } = useCopyProfileStore()
  const transI18n = useTranslations("DataPage")
  const { locale } = useLocaleStore()
  const {
    isOpenCreateProfile,
    setIsOpenCreateProfile,
    isOpenCopy,
    setIsOpenCopy,
    isOpenAvatars,
    setIsOpenAvatars
  } = useModelStore()
  const { avatars, setAvatar } = useUserDataStore()
  const [profileName, setProfileName] = useState("");
  const [formState, setFormState] = useState("EDIT");
  const [profileEdit, setProfileEdit] = useState(-1);
  const { isConnectPS } = useGlobalStore()

  const profileCurrent = useMemo(() => {
    if (!avatarSelected) return null;
    const avatar = avatars[avatarSelected.ID];
    return avatar?.profileList[avatar.profileSelect] || null;
  }, [avatarSelected, avatars]);

  const listProfile = useMemo(() => {
    if (!avatarSelected) return [];
    const avatar = avatars[avatarSelected.ID];
    return avatar?.profileList || [];
  }, [avatarSelected, avatars]);


  const handleUpdateProfile = () => {
    if (!profileName.trim()) return;
    if (formState === "CREATE" && avatarSelected && avatars[avatarSelected.ID]) {
      const newListProfile = [...listProfile]
      const newProfile = {
        profile_name: profileName,
        lightcone: null,
        relics: {} as Record<string, RelicStore>
      }
      newListProfile.push(newProfile)
      setAvatar({ ...avatars[avatarSelected.ID], profileList: newListProfile, profileSelect: newListProfile.length - 1 })
      toast.success("Profile created successfully")
    } else if (formState === "EDIT" && profileCurrent && avatarSelected && profileEdit !== -1) {
      const newListProfile = [...listProfile]
      newListProfile[profileEdit].profile_name = profileName;
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
    if (!avatarSelected) return;
    if (avatars[avatarSelected.ID].profileSelect === profileId) return;
    setAvatar({ ...avatars[avatarSelected.ID], profileSelect: profileId })
    toast.success(`Profile changed to Profile: ${avatars[avatarSelected.ID].profileList[profileId].profile_name}`)
  }

  const handleDeleteProfile = (profileId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!avatarSelected || profileId == 0) return;
    if (window.confirm(`Are you sure you want to delete profile: ${avatars[avatarSelected.ID].profileList[profileId].profile_name}?`)) {
      const newListProfile = [...listProfile]
      newListProfile.splice(profileId, 1)
      setAvatar({ ...avatars[avatarSelected.ID], profileList: newListProfile, profileSelect: profileId - 1 })
      toast.success(`Profile ${avatars[avatarSelected.ID].profileList[profileId].profile_name} deleted successfully`)
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
        <div className="px-6 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-semibold text-lg">
                {transI18n("profileName")}
              </span>
            </label>
            <input
              type="text"
              placeholder={transI18n("placeholderProfileName")}
              className="input input-warning mt-1 w-full"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-success btn-sm sm:btn-md" onClick={handleUpdateProfile}>
              {formState === "CREATE" ? transI18n("create") : transI18n("update")}
            </button>
          </div>
        </div>
      )
    },
    {
      id: "copy_profile_modal",
      title: transI18n("copyProfiles").toUpperCase(),
      isOpen: isOpenCopy,
      onClose: () => {
        setIsOpenCopy(false)
        handleCloseModal("copy_profile_modal")
      },
      content: <CopyImport />
    },
    {
      id: "avatars_modal",
      title: transI18n("avatars").toUpperCase(),
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



  return (
    <div className="w-full px-4 pb-4 bg-base-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-items-center">

        <div className="flex flex-col justify-center w-full">
          <div className="flex flex-wrap items-center gap-2 ">
            <div className="flex flex-wrap items-center h-full opacity-80 lg:hover:opacity-100 cursor-pointer text-base md:text-lg lg:text-xl">
              {avatarSelected && (
                <div className="flex flex-wrap items-center justify-start h-full w-full">
                  <Image
                    src={`${process.env.CDN_URL}/${damageType?.[avatarSelected?.DamageType]?.Icon}`}
                    alt={'damage type'}
                    unoptimized
                    crossOrigin="anonymous"
                    className="h-10 w-10 object-contain"
                    width={100}
                    height={100}
                  />
                  <p className="text-center font-bold text-lg">
                    {transI18n(avatarSelected.BaseType.toLowerCase())}
                  </p>
                  <div className="text-center font-bold text-lg">{" / "}</div>
                  <ParseText
                    locale={locale}
                    text={getNameChar(locale, transI18n, avatarSelected).toWellFormed()}
                    className={"font-bold text-lg"}
                  />
                  <div className="text-center italic text-sm ml-2"> {`(${avatarSelected.ID})`}</div>
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base opacity-70 font-bold w-16">{transI18n("profile")}:</span>
            <div className="dropdown dropdown-center md:dropdown-start">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-warning border-info btn-soft gap-1"
              >
                <span className="truncate max-w-48 font-bold">
                  {profileCurrent?.profile_name}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <ul className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box min-w-max w-full mt-1 border border-base-300 max-h-60 overflow-y-auto">
                {listProfile.map((profile, index) => (
                  <li key={index} className="grid grid-cols-12">
                    <button
                      className={`col-span-8 btn btn-ghost`}
                      onClick={() => handleProfileSelect(index)}
                    >
                      <span className="flex-1 truncate text-left">
                        {profile.profile_name}
                        {index === 0 && (
                          <span className="text-xs text-base-content/60 ml-1">({transI18n("default")})</span>
                        )}
                      </span>

                    </button>
                    {index !== 0 && (
                      <>
                        <button
                          className="col-span-2 flex items-center justify-center text-lg text-warning hover:bg-warning/20 z-20 w-full h-full"
                          onClick={() => {
                            setFormState("EDIT");
                            setProfileName(profile.profile_name)
                            setProfileEdit(index)
                            setIsOpenCreateProfile(true)
                            handleShow("update_profile_modal")
                          }}
                          title="Edit Profile"
                        >
                          <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4l10.293-10.293a1 1 0 000-1.414l-2.586-2.586a1 1 0 00-1.414 0L4 16v4z" />
                          </svg>
                        </button>
                        <button
                          className="col-span-2 flex items-center justify-center text-error hover:bg-error/20 z-20 w-full h-full text-lg"
                          onClick={(e) => {
                            handleDeleteProfile(index, e)
                          }}
                          title="Delete Profile"
                        >
                          <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3m5 0H4" />
                          </svg>
                        </button>
                      </>
                    )}
                  </li>
                ))}

                <li className="border-t border-base-300 mt-2 pt-2 z-10">
                  <button
                    onClick={() => {
                      setIsOpenCopy(true)
                      setResetData(baseType, damageType)
                      handleShow("copy_profile_modal")
                    }}
                    className="btn btn-ghost flex justify-start px-3 py-2 h-full w-full hover:bg-base-200 cursor-pointer text-primary z-20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {transI18n("copyProfiles")}
                  </button>
                  <button
                    className="btn btn-ghost flex justify-start px-3 py-2 h-full w-full hover:bg-base-200 cursor-pointer text-primary z-20"
                    onClick={() => {

                      setIsOpenCreateProfile(true)
                      setFormState("CREATE");
                      setProfileName("")
                      handleShow("update_profile_modal")
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {transI18n("addNewProfile")}
                  </button>
                </li>
              </ul>
            </div>
            <div className=" grid grid-cols-2 w-full sm:hidden gap-2">
              <button
                onClick={() => {
                  setIsOpenAvatars(true)
                  handleShow("avatars_modal")
                }}
                className="col-span-1 btn btn-warning btn-sm w-full">
                {transI18n("avatars")}
              </button>
              <div className="col-span-1 dropdown dropdown-center w-full">
                <label tabIndex={0} className="btn btn-info btn-sm w-full">
                  {transI18n("actions")}
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box min-w-max w-full mt-1 border border-base-300 max-h-60 overflow-y-auto"
                >
                  <li>
                    <button onClick={() => actionMove('')}>
                      {transI18n("characterInformation")}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => actionMove('relics-info')}>
                      {transI18n("relics")}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => actionMove('eidolons-info')}>
                      {transI18n("eidolons")}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => actionMove('skills-info')}>
                      {transI18n("skills")}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => actionMove('showcase-card')}>
                      {transI18n("showcaseCard")}
                    </button>
                  </li>
                  <li>
                    <button onClick={handleConnectOrSyncPS} className="btn btn-primary btn-sm">
                      {isConnectPS ? transI18n("sync") : transI18n("connectPs")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        <div className="hidden sm:grid grid-cols-3 gap-2 w-full">
          <button className="btn btn-success btn-sm" onClick={() => actionMove("")}>
            {transI18n("characterInformation")}
          </button>
          <button className="btn btn-success btn-sm" onClick={() => actionMove("relics-info")}>
            {transI18n("relics")}
          </button>
          <button className="btn btn-success btn-sm" onClick={() => actionMove("eidolons-info")}>
            {transI18n("eidolons")}
          </button>
          <button className="btn btn-success btn-sm" onClick={() => actionMove("skills-info")}>
            {transI18n("skills")}
          </button>
          <button className="btn btn-success btn-sm" onClick={() => actionMove("showcase-card")}>
            {transI18n("showcaseCard")}
          </button>
          <button onClick={handleConnectOrSyncPS} className="btn btn-primary btn-sm">
            {isConnectPS ? transI18n("sync") : transI18n("connectPs")}
          </button>
        </div>

        {modalConfigs.map(({ id, title, onClose, content }) => (
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
    </div>
  );
}
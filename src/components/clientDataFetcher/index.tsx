"use client"

import { useEffect, useState } from "react"
import useCurrentDataStore from "@/stores/currentDataStore"
import useDetailDataStore from "@/stores/detailDataStore"
import useUserDataStore from "@/stores/userDataStore"
import { startBattleConfigSync } from "@/lib/battleConfigSync"
import { isInitialDataReady } from "@/lib/initialDataReady"
import BattleDataFetcher from "@/components/battleDataFetcher"
import { startPreloadModals } from "@/lib/preloadModals"

import {
  useFetchAvatarData,
  useFetchAvatarDetail,
  useFetchChangelog,
  useFetchConfigData,
  useFetchLightconeData,
  useFetchRelicSetData
} from "@/lib/hooks"
import { useTranslations } from "next-intl"

// True once the page has loaded and the browser is idle, so background downloads do not compete with the first screen.
function useAfterPageLoad() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    let idle: number | undefined
    const start = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setDone(true), { timeout: 2000 })
      else setDone(true)
    }
    // If a slow image keeps "load" from firing, do not wait forever.
    const fallback = setTimeout(start, 8000)
    if (document.readyState === "complete") start()
    else window.addEventListener("load", start, { once: true })
    return () => {
      clearTimeout(fallback)
      window.removeEventListener("load", start)
      if (idle !== undefined) window.cancelIdleCallback(idle)
    }
  }, [])
  return done
}

function BackgroundDataFetcher() {
  const afterLoad = useAfterPageLoad()
  return afterLoad ? <BackgroundFetchers /> : null
}

function BackgroundFetchers() {
  const battleType = useUserDataStore(state => state.battle_type)
  useFetchLightconeData()
  useFetchRelicSetData()
  useFetchAvatarDetail()
  useFetchChangelog()
  return <BattleDataFetcher mode={battleType} />
}

export default function ClientDataFetcher({
  children
}: {
  children: React.ReactNode
}) {
  const transI18n = useTranslations("DataPage")
  useEffect(() => startBattleConfigSync(), [])

  const q1 = useFetchConfigData()
  const q2 = useFetchAvatarData()

  const queries = [q1, q2]
  // Do not mount consumers until the requests and the store writes they trigger have finished.
  const detail = useDetailDataStore()
  const avatarSelected = useCurrentDataStore(state => state.avatarSelected)
  const avatarsReady = useUserDataStore(state => !!q2.data &&
    Object.keys(q2.data).every(id => !!state.avatars[id]))
  const ready = queries.every(q => q.isSuccess) && avatarsReady &&
    isInitialDataReady({
      metadata: q1.data?.metaData,
      avatars: q2.data,
    }, detail, { avatarSelected })
  const failed = queries.filter(q => q.isError)
  const [initialized, setInitialized] = useState(false)
  if (ready && !initialized) setInitialized(true)

  useEffect(() => {
    if (initialized || ready) {
      startPreloadModals()
    }
  }, [initialized, ready])

  // After the first pass, background refreshes must not tear down editors or modal drafts.
  if (initialized || ready) return <>{children}<BackgroundDataFetcher /></>

  const progress =
    (queries.filter(q => q.isSuccess).length / queries.length) * 100

  if (failed.length > 0) {
    return (
      <div role="alert" className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div>{transI18n("failedToLoadDataRetry")}</div>
        <button className="btn btn-primary" onClick={() => {
          for (const query of failed) void query.refetch()
        }}>{transI18n("retryLoadingData")}</button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-lg font-semibold">{transI18n("loadingData")}</div>

        <progress
          className="progress progress-primary w-56"
          value={progress}
          max="100"
        />

        <div>{Math.floor(progress)}%</div>
      </div>
    )
  }

  return <>{children}<BackgroundDataFetcher /></>
}
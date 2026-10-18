"use client"

import { useEffect, useState } from "react"
import useCurrentDataStore from "@/stores/currentDataStore"
import useDetailDataStore from "@/stores/detailDataStore"
import useLocaleStore from "@/stores/localeStore"
import useUserDataStore from "@/stores/userDataStore"
import { startBattleConfigSync } from "@/lib/battleConfigSync"
import { isInitialDataReady } from "@/lib/initialDataReady"

import {
  useFetchASGroupData,
  useFetchAvatarData,
  useFetchChangelog,
  useFetchConfigData,
  useFetchLightconeData,
  useFetchMOCGroupData,
  useFetchMonsterData,
  useFetchPeakGroupData,
  useFetchPFGroupData,
  useFetchRelicSetData
} from "@/lib/hooks"
import { useTranslations } from "next-intl"

export default function ClientDataFetcher({
  children
}: {
  children: React.ReactNode
}) {
  const transI18n = useTranslations("DataPage")
  useEffect(() => startBattleConfigSync(), [])

  const q1 = useFetchConfigData()
  const q2 = useFetchAvatarData()
  const q3 = useFetchLightconeData()
  const q4 = useFetchRelicSetData()
  const q5 = useFetchMonsterData()
  const q6 = useFetchPFGroupData()
  const q7 = useFetchMOCGroupData()
  const q8 = useFetchASGroupData()
  const q9 = useFetchPeakGroupData()
  const q10 = useFetchChangelog()

  const queries = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10]
  // Query success precedes the effects which populate the dependent stores.
  // Do not mount consumers until both the requests AND those writes finish.
  const detail = useDetailDataStore()
  const avatarSelected = useCurrentDataStore(state => state.avatarSelected)
  const avatarsReady = useUserDataStore(state => !!q2.data &&
    Object.keys(q2.data).every(id => !!state.avatars[id]))
  const changelog = useLocaleStore(state => state.changelog)
  const ready = queries.every(q => q.isSuccess) && avatarsReady &&
    isInitialDataReady({
      metadata: q1.data?.metaData,
      avatars: q2.data,
      lightcones: q3.data,
      relics: q4.data,
      monsters: q5.data,
      pf: q6.data,
      moc: q7.data,
      as: q8.data,
      peak: q9.data,
      changelog: q10.data,
    }, detail, { avatarSelected }, changelog)
  const failed = queries.filter(q => q.isError)
  const [initialized, setInitialized] = useState(false)
  if (ready && !initialized) setInitialized(true)

  // Background refreshes/import reconciliation must not tear down editors or
  // reset modal drafts after the initial dependency barrier has been passed.
  if (initialized || ready) return <>{children}</>

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

  return <>{children}</>
}
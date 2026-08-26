"use client"

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

export default function ClientDataFetcher({
  children
}: {
  children: React.ReactNode
}) {
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

  const queries = [q1,q2,q3,q4,q5,q6,q7,q8,q9,q10]

  const loading = queries.some(q => q.isLoading)

  const progress =
    (queries.filter(q => q.isSuccess).length / queries.length) * 100

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-lg font-semibold">Loading data...</div>

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
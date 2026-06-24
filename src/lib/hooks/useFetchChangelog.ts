"use client"
import { useQuery } from '@tanstack/react-query'
import { getChangelog } from '@/lib/api'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useModelStore from '@/stores/modelStore'
import useLocaleStore from '@/stores/localeStore'

export const useFetchChangelog = () => {
    const { currentVersion, setChangelog, setCurrentVersion } = useLocaleStore()
    const { setIsChangelog } = useModelStore()
    const query = useQuery({
        queryKey: ['changelog'],
        queryFn: getChangelog,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setChangelog(query.data)
            if (query.data?.[0] && query.data[0].version != currentVersion) {
                setIsChangelog(true)
                setCurrentVersion(query.data[0].version)
            }
        } else if (query.error) {
            toast.error("Failed to load changelog data")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data, query.error, setChangelog, setCurrentVersion, setIsChangelog])

    return query
}

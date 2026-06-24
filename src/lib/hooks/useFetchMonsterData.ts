"use client"
import { useQuery } from '@tanstack/react-query'
import { getMonsterListApi } from '@/lib/api'
import { useEffect } from 'react'
import useDetailDataStore from '@/stores/detailDataStore'
import { toast } from 'react-toastify'

export const useFetchMonsterData = () => {
    const { setMapMonster } = useDetailDataStore()
    const query = useQuery({
        queryKey: ['MonsterData'],
        queryFn: getMonsterListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapMonster(query.data)
        } else if (query.error) {
            toast.error("Failed to load Monster data")
        }
    }, [query.data, query.error, setMapMonster])

    return query
}

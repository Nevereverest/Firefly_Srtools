"use client"
import { useQuery } from '@tanstack/react-query'
import { getPeakEventListApi } from '@/lib/api'
import { useEffect } from 'react'
import useDetailDataStore from '@/stores/detailDataStore'
import { toast } from 'react-toastify'

export const useFetchPeakGroupData = () => {
    const { setMapPeak } = useDetailDataStore()
    const query = useQuery({
        queryKey: ['PeakGroupData'],
        queryFn: getPeakEventListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapPeak(query.data)
        } else if (query.error) {
            toast.error("Failed to load PeakGroup data")
        }
    }, [query.data, query.error, setMapPeak])
    
    return query
}

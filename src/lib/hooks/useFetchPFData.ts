"use client"
import { useQuery } from '@tanstack/react-query'
import { getPFEventListApi } from '@/lib/api'
import { useEffect } from 'react'
import useDetailDataStore from '@/stores/detailDataStore'
import { toast } from 'react-toastify'

export const useFetchPFGroupData = () => {
    const { setMapPF } = useDetailDataStore()
    const query = useQuery({
        queryKey: ['PFGroupData'],
        queryFn: getPFEventListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapPF(query.data)
        } else if (query.error) {
            toast.error("Failed to load PFGroup data")
        }
    }, [query.data, query.error, setMapPF])
    
    return query
}

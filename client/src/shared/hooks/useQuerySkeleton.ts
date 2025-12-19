import { useQuery } from '@tanstack/react-query'

/**
 * Skeleton hook pattern for domain usage.
 * Domains should create their own hooks wrapping usage like this.
 *
 * @example
 * export const useDomainData = (id: string) => {
 *   return useQuery({
 *     queryKey: ['domain', 'entity', id],
 *     queryFn: () => domainApi.fetchEntity(id)
 *   })
 * }
 */
export const useQuerySkeleton = () => {
    return useQuery({
        queryKey: ['skeleton'],
        queryFn: async () => {
            return 'Skeleton Data'
        },
        enabled: false, // Prevent actual execution in skeleton
    })
}

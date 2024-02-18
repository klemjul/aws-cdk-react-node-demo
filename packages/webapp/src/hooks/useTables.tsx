import type { RestaurantTable } from "@app/shared"
import { useMutation, useQuery, useQueryClient } from "react-query"

import { HTTP_API_URL } from "../config"

const TABLE_URL = `${HTTP_API_URL}/table`
const TABLES_QUERY_KEY = "getTables"

async function getTables(): Promise<RestaurantTable[]> {
	const response = await fetch(TABLE_URL)
	if (!response.ok) {
		throw new Error("Failed to fetch tables")
	}
	const tables: RestaurantTable[] = await response.json()
	return tables.sort((a, b) => a.id - b.id)
}

async function putTable(table: RestaurantTable): Promise<RestaurantTable> {
	const response = await fetch(TABLE_URL, {
		method: "PUT",
		body: JSON.stringify(table),
	})
	if (!response.ok) {
		throw new Error("Failed to put table")
	}
	return response.json()
}

function useTables() {
	return useQuery<RestaurantTable[], Error>({
		queryKey: TABLES_QUERY_KEY,
		queryFn: getTables,
		refetchInterval: 1000, // NOTE: prefer WS instead of HTTP polling
	})
}

function useUpdateTableState() {
	const queryClient = useQueryClient()

	return useMutation(putTable, {
		onSuccess: () => {
			queryClient.invalidateQueries(TABLES_QUERY_KEY)
		},
	})
}

export { useTables, useUpdateTableState }

import type { PostRestaurantOrder, RestaurantOrder } from "@app/shared"
import { useMutation, useQuery, useQueryClient } from "react-query"

import { HTTP_API_URL } from "../config"

const ORDER_URL = `${HTTP_API_URL}/order`
const ORDERS_QUERY_KEY = "getOrders"

async function getOrders(): Promise<RestaurantOrder[]> {
	const response = await fetch(ORDER_URL)
	if (!response.ok) {
		throw new Error("Failed to fetch orders")
	}
	const orders: RestaurantOrder[] = await response.json()
	return orders.sort((a, b) => (a.state > b.state ? -1 : 1))
}

async function postOrder(data: PostRestaurantOrder): Promise<RestaurantOrder> {
	const response = await fetch(ORDER_URL, {
		method: "POST",
		body: JSON.stringify(data),
	})
	if (!response.ok) {
		throw new Error("Failed to post order")
	}
	return response.json()
}

function usePostOrder() {
	const queryClient = useQueryClient()

	return useMutation(postOrder, {
		onSuccess: () => {
			queryClient.invalidateQueries(ORDERS_QUERY_KEY)
		},
	})
}

function useOrders() {
	return useQuery<RestaurantOrder[], Error>({
		queryKey: ORDERS_QUERY_KEY,
		queryFn: getOrders,
		refetchInterval: 1000, // NOTE: prefer WS instead of HTTP polling
	})
}

export { useOrders, usePostOrder }

import type { RestaurantMenuItem } from "@app/shared"
import { useQuery } from "react-query"

import { HTTP_API_URL } from "../config"

const MENU_URL = `${HTTP_API_URL}/menu`
const MENUS_QUERY_KEY = "getMenus"

async function getMenuItems(): Promise<RestaurantMenuItem[]> {
	const response = await fetch(MENU_URL)
	if (!response.ok) {
		throw new Error("Failed to fetch menu items")
	}
	return response.json()
}

export default function useMenuItems() {
	return useQuery<RestaurantMenuItem[], Error>({
		queryKey: MENUS_QUERY_KEY,
		queryFn: getMenuItems,
	})
}

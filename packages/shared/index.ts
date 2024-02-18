type RestaurantTableState =
	| "READY_FOR_ORDER"
	| "WATING_ORDER"
	| "EATING"
	| "READY_FOR_CHECKOUT"
type RestaurantOrderState = "WAITING" | "IN_PROGRESS" | "DONE"

type RestaurantTable = {
	id: number
	state: RestaurantTableState
}

type RestaurantOrder = {
	id: string
	tableId: number
	state: RestaurantOrderState
	menuItems: RestaurantMenuItem[]
}

type PostRestaurantOrder = Omit<RestaurantOrder, "id" | "state">

type RestaurantMenuItem = {
	id: number
	name: string
	price: number
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export type {
	PostRestaurantOrder,
	RestaurantMenuItem,
	RestaurantOrder,
	RestaurantOrderState,
	RestaurantTable,
	RestaurantTableState,
}
export { sleep }

import type {
	RestaurantMenuItem,
	RestaurantOrder,
	RestaurantTable,
} from "@app/shared"
import { Button, Spinner, Text } from "@chakra-ui/react"
import React, { useCallback, useEffect, useState } from "react"

import { usePostOrder } from "../../hooks/useOrders"
import { useUpdateTableState } from "../../hooks/useTables"
import RestaurantMenuSelector from "../RestaurantMenuSelector"
import RestaurantOrderRecap from "../RestaurantOrderRecap"
import RestaurantTableCardLayout from "./RestaurantTableCardLayout"

interface RestaurantTableComponentProps {
	table: RestaurantTable
	order?: RestaurantOrder
}

export default function RestaurantTableCard({
	table,
	order,
}: RestaurantTableComponentProps) {
	const { id: tableId, state: tableState } = table
	const [orderClicked, setOrderClicked] = useState(false)
	const [checkoutClicked, setCheckoutClicked] = useState(false)
	const [selectedMenu, setSelectedMenu] = useState<RestaurantMenuItem[]>([])

	const { mutateAsync: postOrder } = usePostOrder()
	const { mutateAsync: checkoutTable } = useUpdateTableState()

	useEffect(() => {
		if (tableState === "READY_FOR_ORDER") {
			setCheckoutClicked(false)
			setOrderClicked(false)
		}
	}, [tableState])

	const handleTakeOrder = useCallback(async () => {
		setOrderClicked(true)
		try {
			await postOrder({
				tableId,
				menuItems: selectedMenu,
			})
		} catch {
			setOrderClicked(false)
		}
	}, [selectedMenu, tableId, postOrder])

	const handleCheckoutTable = useCallback(async () => {
		setCheckoutClicked(true)
		try {
			await checkoutTable({
				id: tableId,
				state: "READY_FOR_ORDER",
			})
		} catch {
			setCheckoutClicked(false)
		}
	}, [tableId, checkoutTable])

	if (tableState === "READY_FOR_ORDER") {
		return (
			<RestaurantTableCardLayout
				bodyContent={
					<RestaurantMenuSelector
						onMenuChanged={(newMenu) => setSelectedMenu(newMenu)}
					/>
				}
				footerContent={
					orderClicked ? (
						<Spinner />
					) : (
						<Button
							size="md"
							variant="outline"
							colorScheme="green"
							onClick={() => handleTakeOrder()}
						>
							Take Order
						</Button>
					)
				}
				table={table}
			/>
		)
	}

	if (tableState === "WATING_ORDER" || tableState === "EATING") {
		return (
			<RestaurantTableCardLayout
				bodyContent={
					order ? <RestaurantOrderRecap order={order} /> : <Spinner />
				}
				footerContent={<Text>No Action</Text>}
				table={table}
			/>
		)
	}

	if (tableState === "READY_FOR_CHECKOUT") {
		return (
			<RestaurantTableCardLayout
				bodyContent={
					order ? <RestaurantOrderRecap order={order} showPrice /> : <Spinner />
				}
				footerContent={
					checkoutClicked ? (
						<Spinner />
					) : (
						<Button
							size="md"
							variant="outline"
							colorScheme="blue"
							onClick={() => handleCheckoutTable()}
						>
							Check Out
						</Button>
					)
				}
				table={table}
			/>
		)
	}

	throw new Error(`tableState=${tableState} not implemented`)
}

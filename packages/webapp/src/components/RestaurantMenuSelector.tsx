import { type RestaurantMenuItem } from "@app/shared"
import {
	Checkbox,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import useMenuItems from "../hooks/useMenu"

interface RestaurantMenuSelectorProps {
	onMenuChanged: (menuItems: RestaurantMenuItem[]) => void
}

export default function RestaurantMenuSelector({
	onMenuChanged,
}: RestaurantMenuSelectorProps) {
	const { data: menuItems, isLoading: menuItemsLoading } = useMenuItems()

	const [itemsSelected, setItemsSelected] = useState<RestaurantMenuItem[]>([])
	useEffect(() => {
		onMenuChanged(itemsSelected)
	}, [itemsSelected, onMenuChanged])

	const itemIsAlreadySelected = useCallback(
		(item: RestaurantMenuItem) =>
			itemsSelected.some((itemSelected) => itemSelected.id === item.id),
		[itemsSelected],
	)
	const handleItemSelection = useCallback(
		(item: RestaurantMenuItem) => {
			if (itemIsAlreadySelected(item)) {
				setItemsSelected(itemsSelected.filter((c) => c.id === item.id))
			} else {
				setItemsSelected((prev) => [...prev, item])
			}
		},
		[itemIsAlreadySelected, itemsSelected],
	)

	if (!menuItems || menuItemsLoading) {
		return <Spinner />
	}

	return (
		<TableContainer>
			<Table variant="simple" size="sm">
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th isNumeric>Price</Th>
					</Tr>
				</Thead>
				<Tbody>
					{menuItems.map((menuItem) => (
						<Tr key={menuItem.id}>
							<Td>{menuItem.name}</Td>
							<Td isNumeric>{menuItem.price}</Td>
							<Td>
								<Checkbox
									defaultChecked={itemIsAlreadySelected(menuItem)}
									onChange={() => handleItemSelection(menuItem)}
								/>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</TableContainer>
	)
}

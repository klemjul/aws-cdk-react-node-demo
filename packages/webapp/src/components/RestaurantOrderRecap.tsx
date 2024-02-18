import type { RestaurantOrder } from "@app/shared"
import { Divider, Flex, Stack, Text } from "@chakra-ui/react"
import React, { useMemo } from "react"

interface RestaurantOrderRecapProps {
	order: RestaurantOrder
	showPrice?: boolean
}

export default function RestaurantOrderRecap({
	order: { id, menuItems, state },
	showPrice = false,
}: RestaurantOrderRecapProps) {
	const totalPrice = useMemo(() => {
		let tot = 0
		menuItems.forEach((menuItem) => {
			tot += menuItem.price
		})
		return tot
	}, [menuItems])
	return (
		<Stack>
			<Text as="u">Order #{id}</Text>
			{menuItems.map((menuItem) => (
				<Flex key={menuItem.id} justifyContent="space-between">
					<Text as="i" fontSize="sm" key={menuItem.id}>
						{menuItem.name}
					</Text>
					{showPrice && (
						<Text as="b" fontSize="sm">
							{menuItem.price}
						</Text>
					)}
				</Flex>
			))}
			{showPrice && (
				<>
					<Divider />
					<Text textAlign="right" as="b" fontSize="sm">
						Total Price: {totalPrice}
					</Text>
				</>
			)}
		</Stack>
	)
}

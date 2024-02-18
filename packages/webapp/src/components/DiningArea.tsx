import { Box, Center, Flex, Heading, Skeleton, Spinner } from "@chakra-ui/react"
import React from "react"

import { useOrders } from "../hooks/useOrders"
import { useTables } from "../hooks/useTables"
import RestaurantTableCard from "./restaurant-table/RestaurantTableCard"

export default function DiningArea() {
	const { data: tables, isLoading: tablesLoading } = useTables()
	const { data: orders, isLoading: ordersLoading } = useOrders()

	if (tablesLoading || !tables || ordersLoading || !orders) {
		return <Skeleton w="70%" />
	}

	return (
		<Box w="70%" h="100%">
			<Center h="10%">
				<Heading as="h2">Dining Area</Heading>
			</Center>
			<Flex p={6} w="100%" h="90%" flexWrap="wrap">
				{tables.map((table, i) => (
					<Box
						key={table.id}
						w="50%"
						h="50%"
						paddingRight={i % 2 === 0 ? 6 : 0}
						paddingBottom={i < tables.length - 2 ? 6 : 0}
					>
						<RestaurantTableCard
							table={table}
							key={table.id}
							order={orders.find((v) => v.tableId === table.id)}
						/>
					</Box>
				))}
			</Flex>
		</Box>
	)
}

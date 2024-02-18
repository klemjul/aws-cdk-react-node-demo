import {
	Box,
	Card,
	CardBody,
	Center,
	Divider,
	Heading,
	Progress,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react"
import React, { useMemo } from "react"

import { useOrders } from "../hooks/useOrders"
import RestaurantOrderRecap from "./RestaurantOrderRecap"

export default function Kitchen() {
	const { data: orders, isLoading: ordersLoading } = useOrders()
	const pendingOrders = useMemo(() => {
		if (orders) {
			return orders.filter((o) => o.state !== "DONE")
		}
		return []
	}, [orders])

	if (!orders || ordersLoading) {
		return <Skeleton w="30%" />
	}

	return (
		<Box w="30%">
			<Center h="10%">
				<Heading as="h2">Kitchen</Heading>
			</Center>
			<Stack p={6}>
				{pendingOrders.map((order) => (
					<Card
						key={order.id}
						direction={{ base: "column", sm: "row" }}
						overflow="hidden"
						variant="outline"
						bg={order.state === "IN_PROGRESS" ? "white" : "grey"}
					>
						<Stack>
							<CardBody>
								{order.state === "IN_PROGRESS" ? (
									<>
										<RestaurantOrderRecap order={order} />
										<Divider />
										<Progress isIndeterminate size="sm" />
									</>
								) : (
									<>
										<Heading size="md">{order.state}</Heading>
										<Text>Order {order.id}</Text>
									</>
								)}
							</CardBody>
						</Stack>
					</Card>
				))}
			</Stack>
		</Box>
	)
}

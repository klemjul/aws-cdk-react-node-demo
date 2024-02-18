import type { RestaurantTable, RestaurantTableState } from "@app/shared"
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Flex,
	Heading,
	Tag,
} from "@chakra-ui/react"
import React from "react"

interface RestaurantTableCardLayoutProps {
	table: RestaurantTable
	bodyContent: JSX.Element
	footerContent: JSX.Element
}

const tableStateTags: { [key in RestaurantTableState]: JSX.Element } = {
	READY_FOR_ORDER: (
		<Tag size="lg" colorScheme="green" variant="solid" borderRadius="full">
			Ready to order
		</Tag>
	),
	WATING_ORDER: (
		<Tag size="lg" colorScheme="yellow" variant="solid" borderRadius="full">
			Waiting dishes
		</Tag>
	),
	EATING: (
		<Tag size="lg" colorScheme="purple" variant="solid" borderRadius="full">
			Eating
		</Tag>
	),
	READY_FOR_CHECKOUT: (
		<Tag size="lg" colorScheme="blue" variant="solid" borderRadius="full">
			Ready to checkout
		</Tag>
	),
}

export default function RestaurantTableCardLayout({
	table: { id: tableId, state: tableState },
	bodyContent,
	footerContent,
}: RestaurantTableCardLayoutProps) {
	return (
		<Card h="100%" size="md">
			<CardHeader>
				<Flex justifyContent="space-between">
					<Heading size="md">Table {tableId}</Heading>
					{tableStateTags[tableState]}
				</Flex>
			</CardHeader>
			<CardBody overflowY="scroll">{bodyContent}</CardBody>
			<CardFooter justify="right">{footerContent}</CardFooter>
		</Card>
	)
}

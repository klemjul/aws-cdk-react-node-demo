import { Box, Divider, Flex } from "@chakra-ui/react"
import React from "react"

import DiningArea from "./components/DiningArea"
import Kitchen from "./components/Kitchen"

function App() {
	return (
		<Box
			h="100vh"
			overflow="hidden"
			bg="#242424"
			color="rgba(255, 255, 255, 0.87)"
		>
			<Flex h="100%">
				<DiningArea />
				<Divider orientation="vertical" />
				<Kitchen />
			</Flex>
		</Box>
	)
}

export default App

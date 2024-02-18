import { type RestaurantTable, sleep } from "@app/shared"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import type { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda"

import { newImageFromDynamodbRecord } from "../aws-utils.js"

const dynamoDbClient = new DynamoDBClient()
const { TABLE_TABLE_NAME } = process.env

export default async function main(event: DynamoDBStreamEvent) {
	await Promise.all(event.Records.map((record) => processRecord(record)))
}

async function processRecord(record: DynamoDBRecord) {
	const newImage = newImageFromDynamodbRecord<RestaurantTable>(record)
	if (!newImage) {
		return
	}
	if (newImage.state === "EATING") {
		// simulate people eating, after 30s the table is ready for checkout
		await sleep(30000)
		await dynamoDbClient.send(
			new PutItemCommand({
				TableName: TABLE_TABLE_NAME,
				Item: marshall({ ...newImage, state: "READY_FOR_CHECKOUT" }),
			}),
		)
	}
}

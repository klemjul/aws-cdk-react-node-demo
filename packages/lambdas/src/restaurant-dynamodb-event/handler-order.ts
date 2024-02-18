import type { RestaurantOrder, RestaurantTable } from "@app/shared"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import type { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda"

import { newImageFromDynamodbRecord } from "../aws-utils.js"

const { KITCHEN_QUEUE_URL, TABLE_TABLE_NAME, ORDER_TABLE_NAME } = process.env
const sqsClient = new SQSClient()
const ddbClient = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocument.from(ddbClient)

export default async function main(event: DynamoDBStreamEvent) {
	await Promise.all(event.Records.map((record) => processRecord(record)))
}

async function processRecord(record: DynamoDBRecord) {
	const newImage = newImageFromDynamodbRecord<RestaurantOrder>(record)
	if (!newImage) {
		return
	}
	const tableOrder = await getTableForOrder(newImage)
	if (!tableOrder) {
		// delete order if the table doesnt exist
		await ddbDocClient.delete({
			TableName: ORDER_TABLE_NAME,
			Key: { id: newImage.id },
		})
		return
	}

	if (newImage.state === "WAITING") {
		// push message to the order queue
		await sqsClient.send(
			new SendMessageCommand({
				QueueUrl: KITCHEN_QUEUE_URL,
				MessageBody: JSON.stringify(newImage),
				MessageGroupId: "ORDER",
			}),
		)

		// set the table state as waiting order
		await ddbDocClient.put({
			TableName: TABLE_TABLE_NAME,
			Item: { ...tableOrder, state: "WATING_ORDER" },
		})
	}
	if (newImage.state === "DONE") {
		// order is done, people are eating
		await ddbDocClient.put({
			TableName: TABLE_TABLE_NAME,
			Item: { ...tableOrder, state: "EATING" },
		})
	}
}

async function getTableForOrder(
	order: RestaurantOrder,
): Promise<RestaurantTable | undefined> {
	const result = await ddbDocClient.get({
		TableName: TABLE_TABLE_NAME,
		Key: { id: order.tableId },
	})
	if (!result.Item) {
		throw new Error(`No table for order ${order.id}`)
	}
	return result.Item as RestaurantTable
}

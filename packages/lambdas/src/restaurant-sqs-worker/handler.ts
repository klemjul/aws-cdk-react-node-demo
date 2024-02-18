import { type RestaurantOrder, sleep } from "@app/shared"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { marshall } from "@aws-sdk/util-dynamodb"
import type { SQSEvent, SQSRecord } from "aws-lambda"

const { KITCHEN_QUEUE_URL, ORDER_TABLE_NAME } = process.env
const sqsClient = new SQSClient()
const dynamodbClient = new DynamoDBClient()

export default async function main(event: SQSEvent): Promise<void> {
	await Promise.all(event.Records.map((record) => processRecord(record)))
}

async function processRecord(record: SQSRecord) {
	const order = JSON.parse(record.body) as RestaurantOrder
	// 1. set order in progress
	await dynamodbClient.send(
		new PutItemCommand({
			TableName: ORDER_TABLE_NAME,
			Item: marshall({ ...order, state: "IN_PROGRESS" }),
		}),
	)
	// 2. simulate kitchen work
	await sleep(15000)

	// 3. set order done
	await dynamodbClient.send(
		new PutItemCommand({
			TableName: ORDER_TABLE_NAME,
			Item: marshall({ ...order, state: "DONE" }),
		}),
	)

	// 4. delete the message from the queue
	await sqsClient.send(
		new DeleteMessageCommand({
			QueueUrl: KITCHEN_QUEUE_URL,
			ReceiptHandle: record.receiptHandle,
		}),
	)
}

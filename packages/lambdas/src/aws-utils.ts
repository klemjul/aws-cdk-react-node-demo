import { AttributeValue } from "@aws-sdk/client-dynamodb"
import * as dynamodbUtils from "@aws-sdk/util-dynamodb"
import type { DynamoDBRecord } from "aws-lambda"

export function newImageFromDynamodbRecord<T>(record: DynamoDBRecord) {
	if (
		record.eventName &&
		record.dynamodb &&
		record.dynamodb.NewImage &&
		["INSERT", "MODIFY"].includes(record.eventName)
	) {
		return dynamodbUtils.unmarshall(
			record.dynamodb.NewImage as Record<string, AttributeValue>,
		) as T
	}
	return undefined
}

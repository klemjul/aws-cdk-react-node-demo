import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"

import { menuItemDatas, tableDatas } from "./datas.js"

const { TABLE_TABLE_NAME, MENU_TABLE_NAME } = process.env
const ddbClient = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocument.from(ddbClient)

export default async function main(): Promise<void> {
	const batchWriteTableDatas = ddbDocClient.batchWrite({
		RequestItems: {
			[TABLE_TABLE_NAME!]: tableDatas.map((td) => ({
				PutRequest: {
					Item: td,
				},
			})),
		},
	})

	const batchWriteMenuDatas = ddbDocClient.batchWrite({
		RequestItems: {
			[MENU_TABLE_NAME!]: menuItemDatas.map((mid) => ({
				PutRequest: {
					Item: mid,
				},
			})),
		},
	})

	await Promise.all([batchWriteMenuDatas, batchWriteTableDatas])
}

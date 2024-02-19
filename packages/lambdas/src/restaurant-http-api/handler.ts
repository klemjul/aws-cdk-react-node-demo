import type { RestaurantOrder } from "@app/shared"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2,
	Context,
} from "aws-lambda"
import { v4 as uuidv4 } from "uuid"

import { PatchTableBodySchema, PostOrderBodySchema } from "./schema.js"

const { TABLE_TABLE_NAME, ORDER_TABLE_NAME, STAGE, MENU_TABLE_NAME } =
	process.env

const ddbClient = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocument.from(ddbClient)

// https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
export default async function main(
	event: APIGatewayProxyEventV2,
	context: Context,
): Promise<APIGatewayProxyResultV2> {
	const {
		requestContext: {
			http: { path, method },
		},
		body,
	} = event

	if (path === `/${STAGE}/table`) {
		if (method === "GET") {
			const res = await ddbDocClient.scan({
				TableName: TABLE_TABLE_NAME,
			})
			return { statusCode: 200, body: JSON.stringify(res.Items ?? []) }
		}
		if (method === "PUT" && body) {
			try {
				const table = await PatchTableBodySchema.validateAsync(JSON.parse(body))
				await ddbDocClient.put({
					TableName: TABLE_TABLE_NAME,
					Item: table,
				})
				return { statusCode: 200, body: JSON.stringify(table) }
			} catch (err) {
				return { statusCode: 400, body: JSON.stringify(err) }
			}
		}
	}

	if (path === `/${STAGE}/order`) {
		if (method === "GET") {
			const res = await ddbDocClient.scan({
				TableName: ORDER_TABLE_NAME,
			})
			return { statusCode: 200, body: JSON.stringify(res.Items ?? []) }
		}
		if (method === "POST" && body) {
			try {
				const postOrder = await PostOrderBodySchema.validateAsync(
					JSON.parse(body),
				)
				const order: RestaurantOrder = {
					...postOrder,
					id: uuidv4(),
					state: "WAITING",
				}
				await ddbDocClient.put({
					TableName: ORDER_TABLE_NAME,
					Item: order,
				})
				return { statusCode: 200, body: JSON.stringify(order) }
			} catch (err) {
				return { statusCode: 400, body: JSON.stringify(err) }
			}
		}
	}

	if (path === `/${STAGE}/menu`) {
		if (method === "GET") {
			const res = await ddbDocClient.scan({
				TableName: MENU_TABLE_NAME,
			})
			return { statusCode: 200, body: JSON.stringify(res.Items ?? []) }
		}
	}
	return {
		statusCode: 400,
		body: JSON.stringify({ message: `Unsuported request ${method} ${path}` }),
		headers: {
			"content-type": "application/json",
		},
	}
}

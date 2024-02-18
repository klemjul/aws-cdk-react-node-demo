import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as sqs from "aws-cdk-lib/aws-sqs"

import RestaurantHttpApi from "../constructs/restaurant-http-api.js"
import RestaurantProcessing from "../constructs/restaurant-processing.js"

interface BackendStackProps extends cdk.StackProps {
	getResourceName: (suffix: string) => string
	stage: string
	tableDb: dynamodb.Table
	orderDb: dynamodb.Table
	menuDb: dynamodb.Table
}

export default class BackendStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: BackendStackProps) {
		super(scope, id, props)
		const { getResourceName } = props

		const kitchenFifoQueue = new sqs.Queue(this, "KitchenFifoQueue", {
			visibilityTimeout: cdk.Duration.seconds(300),
			contentBasedDeduplication: true,
			queueName: getResourceName("kitchen-queue.fifo"),
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			fifo: true,
		})

		const restaurantHttpApi = new RestaurantHttpApi(this, "RestaurantHttpApi", {
			apiStage: props.stage,
			getResourceName,
			tableDb: props.tableDb,
			orderDb: props.orderDb,
			menuDb: props.menuDb,
		})

		const restaurantProcessingApi = new RestaurantProcessing(
			this,
			"RestaurantProcessing",
			{
				getResourceName,
				kitchenFifoQueue,
				orderDb: props.orderDb,
				tableDb: props.tableDb,
				menuDb: props.menuDb,
			},
		)
	}
}

import * as cdk from "aws-cdk-lib"
import * as apigw from "aws-cdk-lib/aws-apigatewayv2"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import * as sqs from "aws-cdk-lib/aws-sqs"
import { Construct } from "constructs"
import * as path from "path"

import { lambdasProjectPath } from "../utils.js"

interface RestaurantProcessingProps {
	getResourceName: (suffix: string) => string
	tableDb: dynamodb.Table
	orderDb: dynamodb.Table
	menuDb: dynamodb.Table
	kitchenFifoQueue: sqs.Queue
}

export default class RestaurantProcessing extends Construct {
	private props: RestaurantProcessingProps

	private stack: cdk.Stack

	constructor(scope: Construct, id: string, props: RestaurantProcessingProps) {
		super(scope, id)
		this.stack = cdk.Stack.of(this)
		this.props = props

		const orderDbEventHandlerFunction = this.orderDbEventHandling()
		const tableDbEventHandlerFunction = this.tableDbEventHandling()
		const kitchenQueueWorkerFunction = this.kitchenQueueWorker()
		const loadDatasFunction = this.loadDatasFunction()
	}

	private orderDbEventHandling(): lambda.Function {
		const orderDbEventHandlerFunction = new NodejsFunction(
			this.stack,
			"OrderDbEventHandlerFunction",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				entry: path.join(
					lambdasProjectPath,
					"src",
					"restaurant-dynamodb-event",
					"handler-order.ts",
				),
				handler: "default",
				environment: {
					TABLE_TABLE_NAME: this.props.tableDb.tableName,
					KITCHEN_QUEUE_URL: this.props.kitchenFifoQueue.queueUrl,
					ORDER_TABLE_NAME: this.props.orderDb.tableName,
				},
				timeout: cdk.Duration.seconds(60),
				functionName: this.props.getResourceName(
					"order-db-event-handler-function",
				),
			},
		)
		orderDbEventHandlerFunction.addEventSource(
			new lambdaEventSources.DynamoEventSource(this.props.orderDb, {
				startingPosition: lambda.StartingPosition.LATEST,
			}),
		)
		this.props.kitchenFifoQueue.grantSendMessages(orderDbEventHandlerFunction)
		this.props.tableDb.grantReadWriteData(orderDbEventHandlerFunction)
		this.props.orderDb.grantReadWriteData(orderDbEventHandlerFunction)
		return orderDbEventHandlerFunction
	}

	private tableDbEventHandling(): lambda.Function {
		const tableDbEventHandlerFunction = new NodejsFunction(
			this.stack,
			"TableDbEventHandlerFunction",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				entry: path.join(
					lambdasProjectPath,
					"src",
					"restaurant-dynamodb-event",
					"handler-table.ts",
				),
				handler: "default",
				environment: {
					TABLE_TABLE_NAME: this.props.tableDb.tableName,
				},
				timeout: cdk.Duration.seconds(60),
				functionName: this.props.getResourceName("table-db-event-handler"),
			},
		)

		tableDbEventHandlerFunction.addEventSource(
			new lambdaEventSources.DynamoEventSource(this.props.tableDb, {
				startingPosition: lambda.StartingPosition.LATEST,
			}),
		)
		this.props.tableDb.grantReadWriteData(tableDbEventHandlerFunction)
		return tableDbEventHandlerFunction
	}

	private kitchenQueueWorker(): lambda.Function {
		const kitchenQueueWorkerFunction = new NodejsFunction(
			this.stack,
			"KitchenQueueWorkerFunction",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				entry: path.join(
					lambdasProjectPath,
					"src",
					"restaurant-sqs-worker",
					"handler.ts",
				),
				handler: "default",
				timeout: cdk.Duration.seconds(60),
				environment: {
					KITCHEN_QUEUE_URL: this.props.kitchenFifoQueue.queueUrl,
					ORDER_TABLE_NAME: this.props.orderDb.tableName,
				},
				functionName: this.props.getResourceName("sqs-worker-function"),
			},
		)
		this.props.orderDb.grantReadWriteData(kitchenQueueWorkerFunction)

		kitchenQueueWorkerFunction.addEventSource(
			new lambdaEventSources.SqsEventSource(this.props.kitchenFifoQueue, {
				batchSize: 1,
			}),
		)

		return kitchenQueueWorkerFunction
	}

	private loadDatasFunction(): lambda.Function {
		const loadDatasFunction = new NodejsFunction(
			this.stack,
			"LoadRestaurantDatasFunction",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				entry: path.join(
					lambdasProjectPath,
					"src",
					"restaurant-load-datas",
					"handler.ts",
				),
				handler: "default",
				timeout: cdk.Duration.seconds(60),
				environment: {
					TABLE_TABLE_NAME: this.props.tableDb.tableName,
					MENU_TABLE_NAME: this.props.menuDb.tableName,
				},
				functionName: this.props.getResourceName(
					"load-restaurant-datas-function",
				),
			},
		)
		this.props.menuDb.grantReadWriteData(loadDatasFunction)
		this.props.tableDb.grantReadWriteData(loadDatasFunction)

		return loadDatasFunction
	}
}

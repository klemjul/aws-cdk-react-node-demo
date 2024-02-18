import * as cdk from "aws-cdk-lib"
import * as apigw from "aws-cdk-lib/aws-apigatewayv2"
import * as apigwIntegrations from "aws-cdk-lib/aws-apigatewayv2-integrations"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import path from "path"

import { lambdasProjectPath } from "../utils.js"

interface RestaurantHttpApiProps {
	getResourceName: (suffix: string) => string
	apiStage: string
	tableDb: dynamodb.Table
	orderDb: dynamodb.Table
	menuDb: dynamodb.Table
}

export default class RestaurantHttpApi extends Construct {
	private stack: cdk.Stack

	constructor(scope: Construct, id: string, props: RestaurantHttpApiProps) {
		super(scope, id)
		this.stack = cdk.Stack.of(this)
		const { getResourceName, apiStage } = props

		// 1. Define a lambda that will handle HttpApi events
		const restaurantHttpApiHandlerFunction = new NodejsFunction(
			this.stack,
			"RestaurantHttpApiHandlerFunction",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				entry: path.join(
					lambdasProjectPath,
					"src",
					"restaurant-http-api",
					"handler.ts",
				),
				handler: "default",
				environment: {
					TABLE_TABLE_NAME: props.tableDb.tableName,
					ORDER_TABLE_NAME: props.orderDb.tableName,
					MENU_TABLE_NAME: props.menuDb.tableName,
					STAGE: props.apiStage,
				},
				functionName: getResourceName("http-api-handler-lambda"),
			},
		)
		props.tableDb.grantReadWriteData(restaurantHttpApiHandlerFunction)
		props.orderDb.grantReadWriteData(restaurantHttpApiHandlerFunction)
		props.menuDb.grantReadWriteData(restaurantHttpApiHandlerFunction)

		// 2. Define an Http Api and integrate the lambda for different paths
		const httpApi = new apigw.HttpApi(this.stack, "HttpApi", {
			apiName: getResourceName("http-api"),
			createDefaultStage: false,
			corsPreflight: {
				allowOrigins: ["*"], // NOT recommended for production
				allowMethods: [apigw.CorsHttpMethod.ANY], // NOT recommended for production
			},
		})

		const httpApiStage = new apigw.HttpStage(
			this.stack,
			`${apiStage}HttpApiStage`,
			{
				httpApi,
				stageName: apiStage,
				autoDeploy: true,
			},
		)

		const restaurantLambdaIntegration =
			new apigwIntegrations.HttpLambdaIntegration(
				"RestaurantHttpLambdaIntegration",
				restaurantHttpApiHandlerFunction,
			)

		// 3. Add routes on the HttpApi
		httpApi.addRoutes({
			path: "/table",
			methods: [apigw.HttpMethod.GET, apigw.HttpMethod.PUT],
			integration: restaurantLambdaIntegration,
		})

		httpApi.addRoutes({
			path: "/order",
			methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
			integration: restaurantLambdaIntegration,
		})

		httpApi.addRoutes({
			path: "/menu",
			methods: [apigw.HttpMethod.GET],
			integration: restaurantLambdaIntegration,
		})

		// 4. Stack Output usefull values
		const httpApiEndpointOutput = new cdk.CfnOutput(
			this.stack,
			"RestaurantHttpApiUrlOutput",
			{
				value: `${httpApi.apiEndpoint}/${httpApiStage.stageName}`,
				exportName: "restaurant-http-api-endpoint",
			},
		)
	}
}

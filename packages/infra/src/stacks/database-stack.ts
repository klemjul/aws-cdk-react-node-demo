import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

interface DatabaseStackProps extends cdk.StackProps {
	getResourceName: (suffix: string) => string
}

export default class DatabaseStack extends cdk.Stack {
	tableDb: dynamodb.Table

	orderDb: dynamodb.Table

	menuDb: dynamodb.Table

	constructor(scope: cdk.App, id: string, props: DatabaseStackProps) {
		super(scope, id, props)

		this.tableDb = new dynamodb.Table(this, "TableDb", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
			tableName: props.getResourceName("table-db"),
			stream: dynamodb.StreamViewType.NEW_IMAGE,
		})

		this.orderDb = new dynamodb.Table(this, "OrderDb", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
			tableName: props.getResourceName("order-db"),
			stream: dynamodb.StreamViewType.NEW_IMAGE,
		})

		this.menuDb = new dynamodb.Table(this, "MenuDb", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
			tableName: props.getResourceName("menu-db"),
			stream: dynamodb.StreamViewType.NEW_IMAGE,
		})
	}
}

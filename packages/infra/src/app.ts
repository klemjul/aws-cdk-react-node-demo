#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"

import BackendStack from "./stacks/backend-stack.js"
import DatabaseStack from "./stacks/database-stack.js"
import FrontendStack from "./stacks/frontend-stack.js"

const PROJECT_NAME = process.env.PROJECT_NAME ?? "restaurant"
const STAGE = process.env.STAGE ?? "sandbox"

const getResourceName = (suffix: string) => `${STAGE}-${PROJECT_NAME}-${suffix}`

const app = new cdk.App()

const databaseStack = new DatabaseStack(app, "DatabaseStack", {
	stackName: getResourceName("database-stack"),
	getResourceName,
})

const backendStack = new BackendStack(app, "BackendStack", {
	stackName: getResourceName("backend-stack"),
	getResourceName,
	orderDb: databaseStack.orderDb,
	tableDb: databaseStack.tableDb,
	menuDb: databaseStack.menuDb,
	stage: STAGE,
})

const frontendStack = new FrontendStack(app, "FrontendStack", {
	stackName: getResourceName("frontend-stack"),
	getResourceName,
})

cdk.Tags.of(app).add("project", PROJECT_NAME)
cdk.Tags.of(app).add("stage", STAGE)
app.synth()

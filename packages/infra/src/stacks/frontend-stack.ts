import * as cdk from "aws-cdk-lib"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import type { Construct } from "constructs"
import * as path from "path"

import { webappProjectPath } from "../utils.js"

interface FrontendStackProps extends cdk.StackProps {
	getResourceName: (suffix: string) => string
}

export default class FrontendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: FrontendStackProps) {
		super(scope, id, props)
		const { getResourceName } = props

		// 1. S3 bucket to store site content, not public
		const webappBucket = new s3.Bucket(this, "Bucket", {
			bucketName: getResourceName("webapp-bucket"),
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			accessControl: s3.BucketAccessControl.PRIVATE,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
		})

		// 2. Cloudfront Distribution (CDN) to deliver website with high performance on edge locations
		const cfOriginAccessIdentity = new cloudfront.OriginAccessIdentity(
			this,
			"OriginAccessIdentity",
		)
		webappBucket.grantRead(cfOriginAccessIdentity)

		const cfWebappOrigin = new cloudfront_origins.S3Origin(webappBucket, {
			originAccessIdentity: cfOriginAccessIdentity,
		})

		const cfDistribution = new cloudfront.Distribution(this, "Distribution", {
			defaultRootObject: "index.html",
			defaultBehavior: {
				origin: cfWebappOrigin,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
		})

		// 3. On site content update, publish it to s3 and invalidate the distribution cache
		const crBucketDeployment = new s3deploy.BucketDeployment(
			this,
			"BucketDeployment",
			{
				destinationBucket: webappBucket,
				sources: [s3deploy.Source.asset(path.join(webappProjectPath, "dist"))],
				distribution: cfDistribution,
			},
		)

		// 4. Stack Output usefull values
		const httpApiEndpointOutput = new cdk.CfnOutput(
			this,
			"RestaurantHttpApiUrlOutput",
			{
				value: cfDistribution.distributionDomainName,
				exportName: "restaurant-cloudfront-domain-name",
			},
		)
	}
}

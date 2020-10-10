import * as cdk from "@aws-cdk/core";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as s3 from "@aws-cdk/aws-s3";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as lambda from "@aws-cdk/aws-lambda";
import { join } from "path";

export class S3SelectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "assetsBucket", {
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      }
    });

    new s3Deployment.BucketDeployment(this, "JSONDeployment", {
      destinationBucket: bucket,
      sources: [s3Deployment.Source.asset(join(__dirname, "../assets"))]
    });

    const selectHandler = new lambda.Function(this, "selectHandler", {
      code: lambda.Code.fromAsset(join(__dirname, "../functions")),
      handler: "handler.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        OBJECT_KEY: "data.json"
      }
    });
    bucket.grantRead(selectHandler);

    const api = new apigw.HttpApi(this, "s3SelectApi");
    api.addRoutes({
      path: "/",
      methods: [apigw.HttpMethod.GET],
      integration: new apigw.LambdaProxyIntegration({ handler: selectHandler })
    });

    new cdk.CfnOutput(this, "APIURL", {
      value: api.url ?? "boo"
    });
  }
}

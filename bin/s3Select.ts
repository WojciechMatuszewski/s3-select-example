#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { S3SelectStack } from "../lib/s3Select-stack";

const app = new cdk.App();
new S3SelectStack(app, "S3SelectStack");

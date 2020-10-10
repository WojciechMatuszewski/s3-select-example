#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ThrowawayStack } from '../lib/throwaway-stack';

const app = new cdk.App();
new ThrowawayStack(app, 'ThrowawayStack');

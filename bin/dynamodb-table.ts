#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DynamodbTableStack } from '../lib/dynamodb-table-stack';

const app = new cdk.App();
new DynamodbTableStack(app, 'DynamodbTableStack', {
  env: {
    region: 'ap-northeast-1',
  }
});

import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import DynamodbTable = require('../lib/dynamodb-table-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DynamodbTable.DynamodbTableStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

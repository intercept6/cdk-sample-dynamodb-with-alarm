import { Stack, Construct, StackProps, Duration, RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Metric, MetricOptions, Alarm, ComparisonOperator } from '@aws-cdk/aws-cloudwatch';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Topic } from '@aws-cdk/aws-sns';

export class DynamodbTableStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'SampleTable', {
      partitionKey: {
        name: 'ID',
        type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.DESTROY
    })

    const topic = new Topic(this, 'Topic');
    const snsAction = new SnsAction(topic);

    const mode: string = 'PROVISIONED'

    switch (mode) {
      case 'AUTO_SCALING':
        const readCapacity = table.autoScaleReadCapacity({
          minCapacity: 10,
          maxCapacity: 1000
        });
        readCapacity.scaleOnUtilization({
          targetUtilizationPercent: 60
        });

        const writeCapacity = table.autoScaleWriteCapacity({
          minCapacity: 10,
          maxCapacity: 1000
        });
        writeCapacity.scaleOnUtilization({
          targetUtilizationPercent: 60
        });
        break;
      case 'PAY_PER_REQUEST':
        const pprAlarmConsumedRCUHigh = new Alarm(this, 'ConsumedRCUHigh', {
          metric: DynamodbTableStack.metricConsumedReadCapacityUnits({
            dimensions: {
              TableName: table.tableName
            }
          }),
          threshold: 240.0,
          evaluationPeriods: 5,
          comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
          alarmDescription: 'DO NOT EDIT OR DELETE. It\'s created by AWS CDK'
        })
        pprAlarmConsumedRCUHigh.addAlarmAction({
          bind(scope, alarm) {
            return snsAction.bind(scope, alarm)
          }
        })
        
        const pprAlarmConsumedWCUHigh = new Alarm(this, 'ConsumedWCUHigh', {
          metric: DynamodbTableStack.metricConsumedWriteCapacityUnits({
            dimensions: {
              TableName: table.tableName
            }
          }),
          threshold: 240.0,
          evaluationPeriods: 5,
          comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
          alarmDescription: 'DO NOT EDIT OR DELETE. It\'s created by AWS CDK'
        })
        pprAlarmConsumedWCUHigh.addAlarmAction({
          bind(scope, alarm) {
            return snsAction.bind(scope, alarm)
          }
        })
        break;
      case 'PROVISIONED':
        const prvAlarmConsumedRCUHigh = new Alarm(this, 'ConsumedRCUHigh', {
          metric: DynamodbTableStack.metricConsumedReadCapacityUnits({
            dimensions: {
              TableName: table.tableName
            },
          }),
          threshold: 240.0,
          evaluationPeriods: 5,
          comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          alarmDescription: 'DO NOT EDIT OR DELETE. It\'s created by AWS CDK',
        })
        prvAlarmConsumedRCUHigh.addAlarmAction({
          bind(scope, alarm) {
            return snsAction.bind(scope, alarm)
          }
        })

        const prvAlarmConsumedWCUHigh = new Alarm(this, 'ConsumedWCUHigh', {
          metric: DynamodbTableStack.metricConsumedWriteCapacityUnits({
            dimensions: {
              TableName: table.tableName
            }
          }),
          threshold: 240.0,
          evaluationPeriods: 5,
          comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          alarmDescription: 'DO NOT EDIT OR DELETE. It\'s created by AWS CDK'
        })
        prvAlarmConsumedWCUHigh.addAlarmAction({
          bind(scope, alarm) {
            return snsAction.bind(scope, alarm)
          }
        })
        break;
      }
  }

  public static metricAll(metricName: string, props?: MetricOptions): Metric {
    return new Metric({
      namespace: 'AWS/DynamoDB',
      metricName,
      ...props
    });
  }

  public static metricConsumedReadCapacityUnits(props? : MetricOptions) {
    return this.metricAll(
      'ConsumedReadCapacityUnits', 
      {
        statistic: 'sum',
        period: Duration.minutes(1),
        ...props
      }
      )
  }
  public static metricConsumedWriteCapacityUnits(props? : MetricOptions) {
    return this.metricAll(
      'ConsumedWriteCapacityUnits', 
      {
        statistic: 'sum',
        period: Duration.minutes(1),
        ...props
      }
      )
  }
}

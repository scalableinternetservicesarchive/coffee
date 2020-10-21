export enum LambdaFunc {
  PING = 'PING',
  LOAD = 'LOAD',
}

/**
 * ServiceReq is the type of the JSON data we send to invoke the lambda via "service request".
 *
 * It is the same as the JSON data passed to the Lambda's main handler method by the AWS Lambda runtime.
 *
 * aws lambda invoke --region=us-west-2 --function-name=bespin --payload='{"function":"PING"}' output.txt
 */
export interface ServiceReq {
  function: LambdaFunc
  args: any
}

export interface ServiceResp {
  result?: any
  errorMessage?: string
}

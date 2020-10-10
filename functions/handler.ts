import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import S3Client from "aws-sdk/clients/s3";

const S3 = new S3Client();

const handler: APIGatewayProxyHandlerV2 = async () => {
  const result = await S3.selectObjectContent({
    Bucket: process.env.BUCKET_NAME as string,
    Key: process.env.OBJECT_KEY as string,
    ExpressionType: "SQL",
    // Notice that the data.json is an array.
    // First [*] means the whole file
    // Second [*] means every index
    // The `r` is just an alias for the "current" object
    Expression: "SELECT r.tags FROM s3object[*][*] r;",
    InputSerialization: {
      JSON: {
        Type: "Document"
      }
    },
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ","
      }
    }
  }).promise();

  if (!result.Payload) return { statusCode: 400, body: "No event payload!" };

  const events = result.Payload;

  let payload = "";
  // You can use async iterables with readable streams :o
  for await (const event of events) {
    // weird typings
    if (typeof event == "string" || Buffer.isBuffer(event)) {
      continue;
    }

    if (event.Records) {
      payload += event.Records?.Payload?.toString("utf-8");
    }

    if (event.End) {
      console.log("END!");
    }
  }

  return { statusCode: 200, body: payload };
};

export { handler };

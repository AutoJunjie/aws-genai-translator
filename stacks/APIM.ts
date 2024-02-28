import { 
  Function,
  StackContext,
  StaticSite,
  Table,
  ApiGatewayV1Api,
  Bucket } from "sst/constructs";
import { Role,ServicePrincipal,PolicyStatement,Effect } from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib";
import { attachPermissionsToRole } from "sst/constructs";

export function API({stack}: StackContext) {

  const role = new Role(stack, "ApiRole", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    managedPolicies: [
      {
        managedPolicyArn:
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      },
    ],
  });
  
  const bedrockPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:*"], // replace with actual bedrock actions
    resources: ["*"], // replace with actual resources
  });
  
  role.addToPolicy(bedrockPolicy);
  
  const s3Bucket = new Bucket(stack, "Bucket", {
    blockPublicACLs: true,
    cors: [
      {
        allowedHeaders: ["*"],
        allowedMethods: ["GET","PUT","POST"],
        allowedOrigins: ["*"],
      }
    ],
  });

  const dynamoTable = new Table(stack, "items", {
    fields: {
      id: "string",
    },
    primaryIndex: { partitionKey: "id" },
    stream: true,
    cdk: {
      table: {
        removalPolicy: RemovalPolicy.DESTROY
      },
    }
  });

  // Attach permissions to role
  attachPermissionsToRole(role, [
    s3Bucket,
    dynamoTable
  ]);

  stack.setDefaultFunctionProps({
    role,
    environment: {
      PRIMARY_KEY: 'id',
      TABLE_NAME: dynamoTable.tableName,
      UploadBucket: s3Bucket.bucketName
    }
  });

  //type RuntimeType = "python3.9" | "container" 
//
  //let runtime_config: RuntimeType;
  //let handler_config: string | undefined;
  //
  //if (stack.stage === "dev") {
  //  runtime_config = "python3.9"; // assuming option1 is "python3.9"
  //  handler_config = "packages/functions/src/translation/lambda.handler";
  //} else {
  //  runtime_config = "container";
  //  handler_config = "packages/functions/src/translation";
  //}

  const TranslatorLambda = new Function(stack, "translatorFunction", {
    runtime: "container",
    handler: "packages/functions/src/translation",
    timeout: 900,
    role,
    environment: {
      PRIMARY_KEY: 'id',
      TABLE_NAME: dynamoTable.tableName,
      UploadBucket: s3Bucket.bucketName
    }
  });
  

  dynamoTable.addConsumers(stack, {
    consumer1: {
      function: TranslatorLambda,
    }
    },
  );

  //const getOneLambda = new Function(stack, "getOneItemFunction", {
  //  handler: "functions/crud/get-one.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //  }
  //});
  //const getAllLambda = new Function(stack, "getAllItemsFunction", {
  //  handler: "functions/crud/get-all.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //  }
  //});
  //const createOneLambda = new Function(stack, "createItemFunction", {
  //  handler: "functions/crud/create.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //  }
  //});
  //const updateOneLambda = new Function(stack, "updateItemFunction", {
  //  handler: "functions/crud/update-one.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //  }
  //});
  //const deleteOneLambda = new Function(stack, "deleteItemFunction", {
  //  handler: "functions/crud/delete-one.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //  }
  //});
  //const GetPreSignURLLambda = new Function(stack, "GetPreSignURLFunction", {
  //  handler: "functions/translation/get-presign-url.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //    UploadBucket: s3Bucket.bucketName
  //  }
  //});
  //const GetDownloadURLLambda = new Function(stack, "GetDownloadURLFunction", {
  //  handler: "functions/translation/download.handler",
  //  runtime: "python3.9",
  //  role,
  //  environment: {
  //    PRIMARY_KEY: 'id',
  //    TABLE_NAME: dynamoTable.tableName,
  //    UploadBucket: s3Bucket.bucketName
  //  }
  //});

  // Create an API Gateway resource for each of the CRUD operations
  const api = new ApiGatewayV1Api(stack, "Api", {
    routes: {
      "GET /items": {
        function: "packages/functions/src/crud/get-all.handler",
    },   
      "POST /items": {
        function: "packages/functions/src/crud/create.handler",
    },       
      "GET /items/{id}": {
        function: "packages/functions/src/crud/get-one.handler",
    },
      "PUT /items/{id}": {
        function: "packages/functions/src/crud/update-one.handler",
    },
      "DELETE /items/{id}": {
        function: "packages/functions/src/crud/delete-one.handler",
    },
      "POST /download": {
        function: "packages/functions/src/s3action/download.handler",
    },
      "POST /presignurl": {
        function: "packages/functions/src/s3action/get-presign-url.handler",
  },   
  },
    cdk: {
      restApi: {
        restApiName: 'Items Service'
      }
    }
  });
  const site = new StaticSite(stack, "ReactSite", {
    path: "packages/frontend",
    buildCommand: "yarn build",
    buildOutput: "build",
    environment: {
      REACT_APP_API_URL: api.url,
    },
  });

  // Show the URLs in the output
  stack.addOutputs({
    SiteUrl: site.url,
    ApiEndpoint: api.url,
  });
}
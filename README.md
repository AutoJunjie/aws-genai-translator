# Serverless GenAI Translator (无服务器AI翻译器)

<img width="635" alt="image" src="https://github.com/AutoJunjie/aws-genai-translator/assets/38706868/cdd32846-97c2-4f9b-a3a2-bcd2a4a0966e">

1. 用户通过前端触发API向s3申请Pre-sign URL并将文件通过URL上传到S3桶
2. 上传完成后前端触发API创建翻译任务，Lambda接收到请求后在DDB创建任务
3. DDB streaming触发Lambda进行翻译任务，任务可并发进行，默认3个worker：
 - 拆分word文档，和prompt组合发送给AWS Bedrock Claude3进行翻译任务
 - 翻译完成，Lambda 将DDB对应条目修改状态为完成，最后组装成完整word文档存入s3，待用户从前端进行下载
 
## Getting Started

[**Read the tutorial**](https://sst.dev/examples/how-to-create-a-reactjs-app-with-serverless.html)

Install the example.

```bash
$ git clone https://github.com/AutoJunjie/aws-genai-translator.git
```

## Commands

### `npm run dev`

Starts the Live Lambda Development environment. （本地起dev环境）

### `npx sst deploy --stage prod`

Deploy all your stacks to AWS. (正式在AWS里起部署)

## Documentation

Learn more about the SST.

- [Docs](https://docs.sst.dev/)
- [sst](https://docs.sst.dev/packages/sst)

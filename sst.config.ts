import { SSTConfig } from "sst";
import { API } from "./stacks/APIM";

export default {
  config(_input) {
    return {
      name: "genai-translator",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "python3.9",
    });
    app.stack(API);
  }
} satisfies SSTConfig;

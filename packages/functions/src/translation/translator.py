import json
import boto3
import re
import logging

logger = logging.getLogger('translator')
logger.setLevel(logging.INFO)

bedrock = boto3.client(service_name='bedrock-runtime')

CONST_CLINT_SIDE_ERROR = "client_side_error"


def _get_complete_prompt(query, from_language='Chinese', to_language='English'):
    full_prompt = f"""
            You are a helpful and honest AI assistant, now I want you to 
            help in translation for the give text. 
            you will translate the {from_language} to its {to_language} version.  
            The following are the rules to follow during the translation.
            
            * The input will be in <TO_TRANSLATE> tag. they can be words, numbers, or single character, 
                Sometimes they are already in the target language, then only respond the original text into the <TRANSLATED> tag.
            * it is OK if you don't very confident to translate, 
                in such cases, you can give the best translate you can, because we will have human review later on.
            * Your output will be put to <TRANSLATED></TRANSLATED> tag. 
            * So, in summary, <TRANSLATED> tag should contain translated or original text, 
                <error> tag should contain the reason why you cannot translate.
            
            <TO_TRANSLATE>{query}</TO_TRANSLATE>
        """
    return json.dumps({
        "prompt": f"\n\nHuman:{full_prompt} \n\nAssistant:",
        "max_tokens_to_sample": 4096,
        "temperature": 0.5,
        "top_p": 1,
    })


def agent_bedrock(query, from_language, to_language):
    """
    Send the query to bedrock.
    """
    # modelId = 'anthropic.claude-v2:1'
    modelId = 'anthropic.claude-v2'
    accept = 'application/json'
    contentType = 'application/json'

    response = bedrock.invoke_model(body=_get_complete_prompt(
        query, from_language, to_language), modelId=modelId, accept=accept, contentType=contentType)
    response_body = json.loads(response.get('body').read())
    final_response = response_body['completion']

    logger.info(f"< Bedrock response: {final_response}")
    match = re.search(r'<TRANSLATED>([\s\S]*?)</TRANSLATED>', final_response)
    if match:
        final_response = match.group(1)
    logger.info(f"> input is: {query}, from {from_language} to {to_language} \n < Final response: {final_response}\n\n")
    return final_response

def agent_bedrock_streaming(query, from_language, to_language):
    """
    Send the query to bedrock.
    TODO: handle the bedrock error and rejections from bedrock.
    """
    # modelId = 'anthropic.claude-v2:1'
    modelId = 'anthropic.claude-v2'
    accept = 'application/json'
    contentType = 'application/json'
    
    logger.info(f'> input is: {query}, from {from_language} to {to_language}')

    response = bedrock.invoke_model_with_response_stream(body=_get_complete_prompt(
        query, from_language, to_language), modelId=modelId, accept=accept, contentType=contentType)
    # logger.info(response)
    response_body = response.get('body')

    # Iterate over events in the event stream as they come
    final_response = ""
    for event in response_body:
        # If we received a records event, write the data to a file
        # logger.info(f">> {event}")
        data = json.loads(event['chunk']['bytes'])
        # logger.info(data['completion'], end='')

        final_response = final_response + data['completion']
        # If we received a progress event, logger.info the details
        if data['stop_reason'] is not None:
            logger.info(">>>> stop reason: "+ data['stop_reason'])
            continue

    logger.info(f"< Bedrock response: {final_response}")
    match = re.search(r'<TRANSLATED>([\s\S]*?)</TRANSLATED>', final_response)
    if match:
        final_response = match.group(1)
    logger.info(f"< Final response: {final_response}\n\n")
    return final_response


# if __name__ == "__main__":
# 
import json
import boto3
import re
import logging

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
    return {
        "prompt": f"\n\nHuman:{full_prompt} \n\nAssistant:",
        "max_tokens_to_sample": 4096,
        "temperature": 0.5,
        "top_p": 1,
    }

print(f'{_get_complete_prompt("你好吗", "zh", "en")}')

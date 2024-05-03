import axios from 'axios';

interface TranslationResponse {
    translatedText: string;
  }

/**
 * translates text using the Google Cloud API
 * @param text text that needed to be translated
 * @param from original language
 * @returns the translated text
 */
async function translateFunction(texts: string[], from: string): Promise<string> {
    const endpoint: string = 'https://translation.googleapis.com/language/translate/v2';
    const targetLanguage: string = 'zh'; // translating to chinese

    const url = `${endpoint}?key=AIzaSyDD_mQKALNP0mWqdk1mtoQEX9F0nmePc9c`;

    try {
        const response = await axios.post(url, {
            q: texts,
            source: from,
            target: targetLanguage,
            format: 'text'
        });

        return response.data.data.translations.map((translation: TranslationResponse) => translation.translatedText);
    } catch (error) {
        console.error('Error calling Google Cloud Translation API:', error);
        throw error;
    }
}

export default translateFunction;



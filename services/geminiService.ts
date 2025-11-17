import { GoogleGenAI, GenerateContentResponse, Chat, Type, Modality } from "@google/genai";
// FIX: Added 'Article' to the import to be used in the new 'getPersonalizedRecommendations' function.
import { TrendingTopic, Author, MarketingAssets, SeoSuggestions, Article } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("A variável de ambiente API_KEY não está definida");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = "Você é um escritor especialista para um blog de tecnologia como o Wired.com, chamado InnovateFlow. Gere um artigo bem estruturado, perspicaz e envolvente com base no comando do usuário. Use markdown para formatação. Para tornar o artigo mais envolvente e fácil de ler, insira pelo menos dois placeholders de imagem em seções apropriadas usando o formato exato `![Uma legenda descritiva para a imagem]()`. Torne as descrições detalhadas e adequadas para que um gerador de imagens de IA crie um visual relevante. Por exemplo, `![Uma representação abstrata de bits quânticos girando em um computador futurista]()`. Não invente fatos; use informações fundamentadas, se disponíveis.";

interface ArticleMetadata {
  category: string;
  targetAudience: string;
  tone: string;
  style: string;
  authorId: string;
}

/**
 * A simple markdown to HTML parser.
 * Note: This is a basic implementation. For production, a more robust library is recommended.
 */
export function parseMarkdown(markdown: string): string {
    if (!markdown) return '';

    // The order of replacement matters.
    let html = markdown
        // Images ![alt](src)
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="rounded-lg my-6 w-full h-auto object-cover" />')
        // Headings (e.g., #, ##, ###)
        .replace(/^### (.*$)/gim, '<h3 class="text-xl md:text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl md:text-4xl font-extrabold mt-4 mb-4 text-gray-900 dark:text-white">$1</h1>')
        // Blockquotes > quote
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 md:pl-6 my-8 italic text-lg md:text-xl text-gray-800 dark:text-gray-200">$1</blockquote>')
        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Unordered lists
        .replace(/^\s*[-*] (.*)/gim, '<ul>\n<li>$1</li>\n</ul>')
        .replace(/<\/ul>\n<ul>/gim, '') // Combine adjacent list items
        // Process paragraphs
        .split('\n\n')
        .map(paragraph => {
            if (!paragraph.trim()) return '';
            // Don't wrap elements that are already blocks
            if (paragraph.trim().match(/^<(h[1-6]|ul|blockquote|img)/)) {
                return paragraph;
            }
            return `<p class="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-8">${paragraph.replace(/\n/g, '<br />')}</p>`;
        })
        .join('');

    return html;
}

/**
 * Generates an image using Imagen 4.
 * @param prompt The prompt for the image.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns A base64 encoded data URL for the generated image.
 */
export const generateImageWithPrompt = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9'): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Uma imagem de alta qualidade e visualmente atraente em português do Brasil. A imagem deve ilustrar: ${prompt}. Estilo: fotorrealista, moderno, estética limpa.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("Nenhuma imagem foi gerada.");

    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        throw new Error("Falha ao gerar imagem da API Imagen.");
    }
};

/**
 * Finds image placeholders in markdown text, generates images, and replaces them.
 * @param articleText The article text with placeholders.
 * @param onProgress Callback to update UI with progress.
 * @returns The article text with embedded images.
 */
const processImagesInArticle = async (articleText: string, onProgress: (status: string) => void): Promise<string> => {
    const imagePlaceholders = [...articleText.matchAll(/!\[(.*?)\]\(\)/g)];
    if (imagePlaceholders.length === 0) {
        return articleText;
    }

    let processedText = articleText;

    for (let i = 0; i < imagePlaceholders.length; i++) {
        const match = imagePlaceholders[i];
        const description = match[1];
        onProgress(`Gerando imagem ${i + 1} de ${imagePlaceholders.length}: "${description}"`);
        
        try {
            const imageUrl = await generateImageWithPrompt(description);
            // The placeholder is replaced with the final markdown syntax including the URL
            processedText = processedText.replace(match[0], `![${description}](${imageUrl})`);
        } catch (e) {
            console.error(`Falha ao gerar imagem para: ${description}`, e);
            // If image generation fails, just add a note and remove the placeholder to avoid a broken experience
            const failureNotice = `\n\n*[Falha na geração da imagem para: ${description}]*\n\n`;
            processedText = processedText.replace(match[0], failureNotice);
        }
    }

    onProgress('Geração de imagens finalizada.');
    return processedText;
};


/**
 * Generates an article using Gemini, including images.
 * @param prompt The prompt for the article.
 * @param useThinkingMode If true, uses gemini-2.5-pro with max thinking budget. Otherwise uses gemini-2.5-flash-lite.
 * @param generateImages If true, generates and embeds images.
 * @param onProgress Callback for status updates.
 * @returns The generated content response.
 */
export const generateArticle = async (prompt: string, useThinkingMode: boolean, generateImages: boolean, onProgress: (status: string) => void): Promise<{text: string}> => {
    onProgress('Gerando texto do artigo...');
    const modelName = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
    const config = useThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                ...config,
                systemInstruction,
            },
        });
        
        if (generateImages) {
            const articleWithImages = await processImagesInArticle(response.text, onProgress);
            return { text: articleWithImages };
        }

        return { text: response.text };
    } catch (error) {
        console.error("Erro ao gerar artigo:", error);
        throw new Error("Falha ao gerar conteúdo da API Gemini.");
    }
};

/**
 * Creates and returns a new Gemini chat instance.
 * @returns A Chat instance.
 */
export const createChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Você é um assistente de IA prestativo para o blog InnovateFlow. Sua função é ajudar os leitores com dúvidas sobre o uso do site. Responda apenas a perguntas relacionadas ao acesso básico do sistema, como encontrar artigos, gerenciar favoritos, inscrever-se na newsletter e solucionar problemas comuns de visualização. Não responda a perguntas sobre o conteúdo dos artigos, tecnologia, ciência ou negócios. Se um usuário perguntar sobre algo fora do seu escopo, direcione-o a ler os artigos ou a entrar em contato com o suporte.',
    },
  });
};

/**
 * Creates and returns a new Gemini chat instance for the marketing consultant AI.
 * @param articleTitle The title of the article for context.
 * @param articleContent The content of the article for context.
 * @returns A Chat instance.
 */
export const createMarketingChat = (articleTitle: string, articleContent: string): Chat => {
  const marketingSystemInstruction = `
    Você é um especialista em marketing digital de classe mundial, com profundo conhecimento em SEO (tráfego orgânico), Google Ads (tráfego pago) e estratégias de crescimento de conteúdo. Você está constantemente atualizado com as últimas tendências e algoritmos do Google.
    Seu nome é 'GrowthBot'.
    Seu objetivo é aconselhar o usuário sobre como promover um artigo de blog específico no contexto de toda a plataforma 'InnovateFlow'.
    O artigo em questão é intitulado: "${articleTitle}"
    Um resumo do conteúdo do artigo é: "${(articleContent || '').substring(0, 500)}..."

    Para cada resposta, forneça insights acionáveis e, quando apropriado, um plano claro e passo a passo.
    Seja proativo e sugira constantemente novas ideias para o crescimento da página com base no artigo e no público-alvo.
    Baseie suas respostas em dados e nas melhores práticas do mercado.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction: marketingSystemInstruction,
    },
  });
};


/**
 * Generates content with Google Search grounding, including images.
 * @param prompt The user's query.
 * @param generateImages If true, generates and embeds images.
 * @param onProgress Callback for status updates.
 * @returns The generated text and a list of sources.
 */
export const getGroundedResponse = async (prompt: string, generateImages: boolean, onProgress: (status: string) => void): Promise<{ text: string, sources: any[] }> => {
    onProgress('Gerando texto do artigo com pesquisa...');
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction,
            },
        });

        // FIX: Ensure that sources is always an array, as groundingChunks can sometimes be a non-array truthy value (e.g., {}), which caused a type error downstream.
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = Array.isArray(groundingChunks) ? groundingChunks : [];
        
        if (generateImages) {
            const articleWithImages = await processImagesInArticle(response.text, onProgress);
            return { text: articleWithImages, sources: sources };
        }
        
        return { text: response.text, sources: sources };
    } catch (error) {
        console.error("Erro com resposta fundamentada:", error);
        throw new Error("Falha ao obter resposta fundamentada da API Gemini.");
    }
};

// FIX: Added missing 'getPersonalizedRecommendations' function to provide personalized article suggestions.
/**
 * Generates personalized article recommendations based on user favorites.
 * @param favoriteArticles - An array of the user's favorite articles.
 * @param allArticles - An array of all available articles to recommend from.
 * @returns A promise resolving to an array of recommended article IDs.
 */
export const getPersonalizedRecommendations = async (
  favoriteArticles: Article[],
  allArticles: Article[]
): Promise<number[]> => {
  if (favoriteArticles.length === 0) {
    return [];
  }

  const favoriteArticlesInfo = favoriteArticles
    .map(a => `  - Título: ${a.title}\n    Descrição: ${a.description}`)
    .join('\n');

  const availableArticles = allArticles.filter(a => !favoriteArticles.some(fav => fav.id === a.id));

  // If there are no other articles to recommend, return empty.
  if (availableArticles.length === 0) {
      return [];
  }

  const allArticlesInfo = availableArticles
    .map(a => `  - ID: ${a.id}\n    Título: ${a.title}\n    Descrição: ${a.description}\n    Categoria: ${a.category}`)
    .join('\n');

  const prompt = `
    Com base nos artigos favoritos de um usuário, recomende 3 outros artigos da lista de todos os artigos disponíveis que sejam mais relevantes.

    Estes são os artigos favoritos do usuário (analise seus temas, categorias e conteúdo):
    ${favoriteArticlesInfo}

    Esta é a lista de todos os artigos disponíveis para recomendação (excluindo os favoritos):
    ${allArticlesInfo}

    Sua resposta DEVE ser um objeto JSON com uma única chave "recommended_ids", que contém um array de até 3 IDs numéricos dos artigos recomendados. Por exemplo: {"recommended_ids": [101, 2, 7]}.
    Não inclua nenhum outro texto, explicações ou formatação markdown. Retorne apenas o JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommended_ids: {
              type: Type.ARRAY,
              items: {
                type: Type.INTEGER,
              }
            }
          },
          required: ["recommended_ids"]
        },
        temperature: 0.2, // Be more deterministic for recommendations
      },
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    
    if (result && Array.isArray(result.recommended_ids)) {
        return result.recommended_ids as number[];
    }
    
    // Fallback for unexpected format (though schema should prevent this)
    console.warn("Formato de recomendação inesperado recebido:", result);
    return [];

  } catch (error) {
    console.error("Erro ao obter recomendações personalizadas:", error);
    return [];
  }
};

/**
 * Suggests article metadata based on a prompt.
 * @param prompt The article idea or prompt.
 * @param authors The list of available authors.
 * @returns A promise resolving to an ArticleMetadata object.
 */
export const suggestArticleMetadata = async (prompt: string, authors: Author[]): Promise<ArticleMetadata> => {
    const authorListForPrompt = authors.map(a => `- ${a.name} (ID: ${a.id}), especialista em ${a.specialty}, focado em categorias: ${a.categories.join(', ')}`).join('\n');
    const generationPrompt = `
      Com base no seguinte prompt de artigo, sugira uma categoria, público-alvo, tom, estilo e o autor mais adequado da lista abaixo.
      Prompt: "${prompt}"

      Lista de Autores Disponíveis:
      ${authorListForPrompt}
      
      Responda apenas com o ID do autor escolhido no campo 'authorId'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        targetAudience: { type: Type.STRING },
                        tone: { type: Type.STRING },
                        style: { type: Type.STRING },
                        authorId: { type: Type.STRING, description: 'O ID do autor mais adequado da lista fornecida.' },
                    },
                    required: ["category", "targetAudience", "tone", "style", "authorId"],
                },
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ArticleMetadata;
    } catch (error) {
        console.error("Erro ao sugerir metadados do artigo:", error);
        throw new Error("Falha ao sugerir metadados da API Gemini.");
    }
};

/**
 * Fetches and ranks trending article topics.
 * @returns A promise resolving to an array of TrendingTopic objects.
 */
export const getTrendingTopics = async (): Promise<TrendingTopic[]> => {
    const prompt = `
        Com base nas últimas notícias e tópicos em alta em tecnologia, ciência, cultura e negócios, gere uma lista classificada de 5 ideias de artigos para um blog chamado InnovateFlow.
        Para cada ideia, forneça um título cativante, uma breve descrição (1-2 frases) e uma classificação de "potencial" (por exemplo, "Alto Potencial", "Potencial Muito Alto") explicando por que é provável que atraia leitores.
        Sua resposta deve ser um array JSON válido de objetos, apenas. Cada objeto deve ter as chaves: "title", "description" e "potential". Não inclua nenhum outro texto, explicações ou formatação markdown.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        let jsonStr = response.text.trim();
        // The model might return the JSON inside a markdown code block.
        // Extract content within ```json ... ``` or ``` ... ```
        const match = jsonStr.match(/```(?:json\s*)?([\s\S]*?)```/);
        if (match && match[1]) {
            jsonStr = match[1];
        }

        return JSON.parse(jsonStr) as TrendingTopic[];
    } catch (error) {
        console.error("Erro ao obter tópicos em alta:", error);
        return [];
    }
};

/**
 * Generates a full suite of marketing assets for a given article.
 * @param title The title of the article.
 * @param content A snippet or the full content of the article.
 * @returns A promise resolving to a MarketingAssets object.
 */
export const generateMarketingAssets = async (title: string, content: string): Promise<MarketingAssets> => {
    const prompt = `
      Crie um pacote de ativos de marketing para um artigo de blog.
      Título do Artigo: "${title}"
      Conteúdo do Artigo (resumo): "${(content || '').substring(0, 2000)}..."

      Gere os seguintes ativos em formato JSON:
      1.  **socialAds**: 3 variações de texto curtas e envolventes para Facebook/Instagram, usando emojis e hashtags relevantes.
      2.  **googleAds**: Um objeto com 'headlines' (5 títulos curtos, estritamente no máximo 30 caracteres) e 'descriptions' (2 descrições, estritamente no máximo 90 caracteres).
      3.  **linkedinAds**: 2 variações de texto com um tom profissional para o LinkedIn, incluindo hashtags.
      4.  **targetAudience**: Uma lista de 3 a 5 sugestões de público-alvo detalhadas (interesses, cargos, demografia).
      5.  **keywords**: Uma lista de 10 a 15 palavras-chave relevantes para campanhas de busca (incluindo cauda longa).
      6.  **campaignAngles**: Uma lista de 3 ângulos de campanha criativos (ex: Foco em Problema/Solução, Foco em Novidade, Foco em Polêmica) para promover o artigo.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        socialAds: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } }
                        },
                        googleAds: {
                            type: Type.OBJECT,
                            properties: {
                                headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                                descriptions: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        },
                        linkedinAds: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } }
                        },
                        targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        campaignAngles: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["socialAds", "googleAds", "linkedinAds", "targetAudience", "keywords", "campaignAngles"]
                }
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as MarketingAssets;
    } catch (error) {
        console.error("Erro ao gerar ativos de marketing:", error);
        throw new Error("Falha ao gerar ativos de marketing da API Gemini.");
    }
};

/**
 * Suggests SEO metadata for an article.
 * @param articleTitle The title of the article.
 * @param articleContent The content of the article.
 * @returns A promise resolving to an SeoSuggestions object.
 */
export const suggestSeoMetadata = async (articleTitle: string, articleContent: string): Promise<SeoSuggestions> => {
    const seoSystemInstruction = `
      Você é um especialista em SEO de classe mundial que trabalha no Google. Sua especialidade é otimizar o conteúdo de blogs para obter a máxima visibilidade e taxa de cliques (CTR) nos resultados de pesquisa.
      Sua tarefa é analisar o título e o conteúdo de um artigo de blog e fornecer o seguinte em formato JSON:
      1.  **title**: Um título otimizado para SEO. Deve ter no máximo 60 caracteres e ser cativante para os usuários.
      2.  **description**: Uma meta descrição otimizada. Deve ter no máximo 160 caracteres e ser escrita de forma persuasiva para incentivar os cliques.
      3.  **keywords**: Uma lista de 10-15 palavras-chave relevantes, incluindo uma mistura de palavras-chave primárias e de cauda longa.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Analise o seguinte artigo e forneça os metadados de SEO.\n\nTítulo: ${articleTitle}\n\nConteúdo: ${articleContent.substring(0, 4000)}...`,
            config: {
                systemInstruction: seoSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'Título otimizado para SEO com no máximo 60 caracteres.' },
                        description: { type: Type.STRING, description: 'Meta descrição otimizada com no máximo 160 caracteres.' },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "description", "keywords"],
                },
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as SeoSuggestions;
    } catch (error) {
        console.error("Erro ao sugerir metadados de SEO:", error);
        throw new Error("Falha ao sugerir metadados de SEO da API Gemini.");
    }
};

// FIX: Added missing audio generation and decoding functions.
/**
 * Generates speech from text using the Gemini TTS model.
 * @param text The text to convert to speech.
 * @returns A promise that resolves to a base64 encoded audio string.
 */
export const generateSpeechFromText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A standard voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    throw new Error("Nenhum áudio foi gerado.");
  } catch (error) {
    console.error("Erro ao gerar fala:", error);
    throw new Error("Falha ao gerar fala da API Gemini.");
  }
};

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 string to decode.
 * @returns A Uint8Array of the decoded data.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * @param data The raw PCM audio data.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio.
 * @param numChannels The number of audio channels.
 * @returns A promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


function dataUrlToParts(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL');
  }
  return { mimeType: match[1], data: match[2] };
}

export const editImageWithPrompt = async (
  imageDataUrl: string,
  prompt: string,
): Promise<string> => {
  try {
    const { mimeType, data } = dataUrlToParts(imageDataUrl);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data,
              mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const newMimeType = part.inlineData.mimeType;
        return `data:${newMimeType};base64,${base64ImageBytes}`;
    }
    
    throw new Error("Nenhuma imagem foi retornada na edição.");

  } catch (error) {
    console.error("Erro ao editar imagem:", error);
    throw new Error("Falha ao editar imagem com a API Gemini.");
  }
};
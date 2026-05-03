const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebScraper = require('./webScraper');
const fs = require('fs').promises;
const path = require('path');

class SimpleChatService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.webScraper = new WebScraper();
        this.appData = null;
        this.knowledgeBase = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            console.log('Initializing Simple Chat Service...');
            console.log('GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY);
            
            try {
                this.appData = await this.webScraper.scrapeAppDocumentation();
                console.log('App data loaded:', !!this.appData);
                console.log('App info:', this.appData?.appInfo?.name || 'No app info');
            } catch (error) {
                console.error('Error loading app data:', error);
                // Create fallback app data
                this.appData = {
                    appInfo: {
                        name: "Basic App",
                        type: "React Native Expo Application with Authentication",
                        description: "Complete authentication system with JWT tokens, form validation, and MongoDB backend.",
                        features: ["JWT Authentication", "Form Validation", "Protected Routes", "User Management", "MongoDB Integration"]
                    },
                    components: [],
                    apiEndpoints: []
                };
                console.log('Using fallback app data');
            }

            // Load knowledge base from JSON
            try {
                const knowledgeBasePath = path.join(__dirname, '../data/knowledgeBase.json');
                const knowledgeBaseData = await fs.readFile(knowledgeBasePath, 'utf8');
                this.knowledgeBase = JSON.parse(knowledgeBaseData);
                console.log('Knowledge base loaded successfully');
            } catch (error) {
                console.error('Error loading knowledge base:', error);
                this.knowledgeBase = null;
            }
            
            this.initialized = true;
            console.log('Chat Service ready!');
        }
    }

    async chat(userMessage, conversationHistory = []) {
        await this.initialize();
        
        // First try JSON knowledge base
        const knowledgeAnswer = await this.searchKnowledgeBase(userMessage);
        if (knowledgeAnswer) {
            return knowledgeAnswer;
        }
        
        // Then try fallback answers
        const fallbackAnswer = this.getFallbackAnswer(userMessage);
        if (fallbackAnswer && !fallbackAnswer.includes('specific jaanna chahte hain')) {
            return fallbackAnswer;
        }
        
        try {
            // Check if API key is available
            if (!process.env.GEMINI_API_KEY) {
                return this.getFallbackAnswer(userMessage);
            }
            
            // Simple context building
            const appContext = this.buildSimpleContext();
            const historyContext = this.buildHistoryContext(conversationHistory);
            
            const prompt = `
You are a friendly chat support assistant for this app. Help users understand what the app does and how it works.

APP INFORMATION:
${appContext}

CONVERSATION HISTORY:
${historyContext}

USER QUESTION: ${userMessage}

Instructions:
- Answer in simple, friendly Hindi/English mix
- Focus on what users actually need to know
- Explain features simply
- If asking about functions, explain what they do in easy terms
- Be helpful and conversational

Answer:`;

            const result = await this.model.generateContent(prompt);
            const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
                console.log('Empty response from Gemini');
                return this.getFallbackAnswer(userMessage);
            }
            
            return text;
            
        } catch (error) {
            console.error('Chat error:', error);
            return this.getFallbackAnswer(userMessage);
        }
    }

    buildSimpleContext() {
        if (!this.appData) return "No app information available.";
        
        const { appInfo, components, apiEndpoints } = this.appData;
        
        let context = `App Name: ${appInfo.name}
Type: ${appInfo.type}
Description: ${appInfo.description}

Main Features:
${appInfo.features.map(f => `• ${f}`).join('\n')}

`;

        if (components && components.length > 0) {
            context += "\nMain Components:\n";
            components.slice(0, 5).forEach(comp => {
                context += `• ${comp.name}: ${comp.description || 'Component'}\n`;
            });
        }

        if (apiEndpoints && apiEndpoints.length > 0) {
            context += "\nAvailable Functions/APIs:\n";
            apiEndpoints.slice(0, 5).forEach(endpoint => {
                context += `• ${endpoint.path}: ${endpoint.method || 'GET'} - ${endpoint.description || 'API endpoint'}\n`;
            });
        }

        return context;
    }

    buildHistoryContext(history) {
        if (!history || history.length === 0) return "No previous conversation.";
        
        return history.map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }

    // Check for inappropriate content
    containsInappropriateContent(text) {
        const inappropriateWords = [
            'maki chut', 'bhand', 'lund', 'chut', 'bc', 'bsdk', 'madarchod', 
            'bhenchod', 'gandu', 'kutta', 'kamine', 'haramkhor'
        ];
        
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
    }

    // Handle inappropriate content
    handleInappropriateContent() {
        return "Main aapke app ki help karne ke liye hun. Kripya respectful language use karein. Kya app ke baare mein poochna chahte hain?";
    }

    // Search JSON knowledge base
    async searchKnowledgeBase(question) {
        if (!this.knowledgeBase) {
            return null;
        }

        // Check for inappropriate content first
        if (this.containsInappropriateContent(question)) {
            console.log('Inappropriate content detected, using fallback response');
            return this.handleInappropriateContent();
        }

        const lowerQuestion = question.toLowerCase().trim();
        const questionWords = lowerQuestion.split(/\s+/).filter(word => word.length > 2);
        
        // Special handling for common JWT token typos
        if (lowerQuestion.includes('jwr') && lowerQuestion.includes('token')) {
            // Look for JWT token answers specifically
            for (const [categoryKey, category] of Object.entries(this.knowledgeBase.categories)) {
                for (const qa of category.questions) {
                    if (qa.keywords.some(k => k.includes('jwt') && k.includes('token'))) {
                        console.log(`Found JWT token answer via typo correction`);
                        return qa.answer;
                    }
                }
            }
        }
        
        // First check fallback responses (greetings, appreciation, etc.)
        for (const [category, responses] of Object.entries(this.knowledgeBase.fallback_responses)) {
            for (const [keyword, response] of Object.entries(responses)) {
                // Use exact matching for fallback responses to avoid false positives
                if (lowerQuestion === keyword || 
                    (keyword.length > 3 && lowerQuestion.includes(keyword)) ||
                    (lowerQuestion.includes(keyword) && keyword.split(' ').length > 1)) {
                    console.log(`Found fallback response for: ${keyword}`);
                    return response;
                }
            }
        }

        // Then search in categories with improved matching
        let bestMatch = null;
        let bestScore = 0;

        for (const [categoryKey, category] of Object.entries(this.knowledgeBase.categories)) {
            for (const qa of category.questions) {
                // Use stricter matching for better accuracy
                let matchScore = 0;
                
                // Only count exact keyword matches
                for (const keyword of qa.keywords) {
                    if (this.matchesKeyword(lowerQuestion, keyword.toLowerCase())) {
                        matchScore += 10; // Exact match gets 10 points
                    } else if (this.enhancedKeywordMatch(lowerQuestion, keyword.toLowerCase())) {
                        matchScore += 3; // Enhanced match gets 3 points
                    }
                }

                // Update best match if this has higher score
                if (matchScore > bestScore && matchScore >= 3) {
                    bestScore = matchScore;
                    bestMatch = {
                        answer: qa.answer,
                        category: category.title,
                        score: matchScore
                    };
                }
            }
        }

        if (bestMatch) {
            console.log(`Found best match in category: ${bestMatch.category} (score: ${bestMatch.score})`);
            return bestMatch.answer;
        }

        return null; // Not found in knowledge base
    }

    // Improved keyword matching
    matchesKeyword(question, keyword) {
        // Exact match
        if (question.includes(keyword)) {
            return true;
        }
        
        // Word boundary matching
        const keywordWords = keyword.split(/\s+/);
        const questionWords = question.split(/\s+/);
        
        // Check if all keyword words are present in question
        const matches = keywordWords.filter(kw => 
            questionWords.some(qw => qw.includes(kw) || kw.includes(qw))
        );
        
        return matches.length === keywordWords.length && keywordWords.length > 0;
    }

    // Partial matching for flexibility
    partialMatch(question, keyword) {
        const questionWords = question.split(/\s+/);
        const keywordWords = keyword.split(/\s+/);
        
        // Check if any significant word matches
        return keywordWords.some(kw => 
            kw.length > 3 && questionWords.some(qw => 
                (qw.includes(kw) || kw.includes(qw)) && 
                Math.abs(qw.length - kw.length) <= 2
            )
        );
    }

    // Fuzzy matching for typos (Levenshtein distance)
    fuzzyMatch(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        
        // Quick check for exact match
        if (str1 === str2) return true;
        
        // Quick check for inclusion
        if (str1.includes(str2) || str2.includes(str1)) return true;
        
        // If lengths are too different, don't bother
        if (Math.abs(len1 - len2) > 2) return false;
        
        // Simple Levenshtein distance calculation
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,     // deletion
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        const distance = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        
        // Allow up to 40% similarity for short words, 30% for longer words
        const threshold = maxLen <= 4 ? 1 : Math.floor(maxLen * 0.3);
        
        return distance <= threshold;
    }

    // Enhanced keyword matching with fuzzy support
    enhancedKeywordMatch(question, keyword) {
        // First try exact match
        if (this.matchesKeyword(question, keyword)) return true;
        
        // Then try fuzzy matching on individual words
        const questionWords = question.toLowerCase().split(/\s+/);
        const keywordWords = keyword.toLowerCase().split(/\s+/);
        
        // Handle common typos and abbreviations
        const commonTypos = {
            'jwr': 'jwt',
            'jwttoken': 'jwt token',
            'jwrtoken': 'jwt token',
            'loging': 'login',
            'singup': 'signup',
            'registation': 'registration',
            'pasword': 'password',
            'tokn': 'token',
            'autentication': 'authentication',
            'authantication': 'authentication',
            'tokken': 'token',
            'loggin': 'login',
            'sinup': 'signup'
        };
        
        // Apply typo corrections
        const correctedQuestionWords = questionWords.map(word => 
            commonTypos[word.toLowerCase()] || word
        );
        
        // For single-word keywords, be more strict
        if (keywordWords.length === 1) {
            const keyword = keywordWords[0];
            return correctedQuestionWords.some(qw => {
                // Direct match
                if (qw === keyword) return true;
                
                // Inclusion match (but keyword must be significant)
                if (keyword.length > 4 && (qw.includes(keyword) || keyword.includes(qw))) return true;
                
                // Typo correction match
                const correctedKw = commonTypos[keyword] || keyword;
                if (qw === correctedKw) return true;
                
                // Fuzzy match only for similar length words
                if (Math.abs(qw.length - keyword.length) <= 2 && this.fuzzyMatch(qw, keyword)) return true;
                
                return false;
            });
        }
        
        // For multi-word keywords, check if most words match
        let matchCount = 0;
        for (const kw of keywordWords) {
            const hasMatch = correctedQuestionWords.some(qw => {
                if (qw === kw) return true;
                if (kw.length > 4 && (qw.includes(kw) || kw.includes(qw))) return true;
                const correctedKw = commonTypos[kw] || kw;
                if (qw === correctedKw) return true;
                if (Math.abs(qw.length - kw.length) <= 2 && this.fuzzyMatch(qw, kw)) return true;
                return false;
            });
            if (hasMatch) matchCount++;
        }
        
        // Require at least 50% of words to match for multi-word keywords
        return matchCount >= Math.ceil(keywordWords.length * 0.5);
    }

    // Quick answers for common questions (backup)
    async quickAnswer(question) {
        await this.initialize();
        
        const quickAnswers = {
            'what is this app': `This is a ${this.appData?.appInfo?.type || 'React Native app'} with authentication features like login, signup, and user management.`,
            'kya karta hai app': 'Ye app authentication ke liye hai - login, signup, user management, form validation, aur MongoDB integration karta hai.',
            'features': this.appData?.appInfo?.features?.join(', ') || 'Authentication, form validation, database integration, user management',
            'how it works': 'React Native app hai with MongoDB backend. JWT tokens use karta hai for authentication. Form validation aur secure routes bhi hai.',
            'functions': 'Main functions hain login, signup, user management, form validation, protected routes, aur database operations.',
            'authentication': 'JWT token based authentication hai. Login/signup ke baad token milta hai jo secure API calls ke liye use hota hai.',
            'database': 'MongoDB use karta hai user data store karne ke liye. Secure aur scalable hai.',
            'security': 'JWT tokens, form validation, aur protected routes use karte hain security ke liye.',
            'login': 'Login karne ke liye email aur password enter karo. Successful login ke baad JWT token milta hai jo 7 din valid hai.',
            'signup': 'Signup mein name, email, aur password enter karte hain. Form validation hoti hai aur password encrypt ho kar database mein save hota hai.',
            'password': 'Password minimum 6 characters ka hona chahiye. Encryption ke baad database mein store hota hai for security.',
            'token': 'JWT token authentication ke liye use hota hai. Login ke baad 7 din valid rehta hai. API calls ke liye required hai.',
            'profile': 'User profile mein name, email, aur account details hote hain. Update aur delete kar sakte hain.',
            'logout': 'Logout karne se token expire ho jata hai aur user ko login screen redirect kar diya jata hai.',
            'routes': 'Protected routes JWT token check karte hain. Agar token nahi hai toh login page redirect kar dete hain.',
            'api': 'RESTful API banaya hai. Endpoints hain: POST /api/auth/login, POST /api/auth/signup, GET /api/auth/profile.',
            'frontend': 'React Native with Expo use kiya hai. Navigation aur state management ke liye hooks use kiye hain.',
            'backend': 'Node.js, Express, MongoDB use kiya hai. Authentication aur security focus hai.',
            'error': 'Error handling proper kiya hai. Form validation aur try-catch blocks use kiye hain.',
            'help': 'Main aapke app ka help desk hun. Authentication, features, functions - kuch bhi pooch sakte hain!',
            'thanks': 'Most welcome! Aur koi sawal hai toh poochiye. Always ready to help! 😊',
            'bye': 'Bye! Jab bhi help chahiye, main available hun. Take care! 👋'
        };

        const lowerQuestion = question.toLowerCase();
        
        for (const [key, answer] of Object.entries(quickAnswers)) {
            if (lowerQuestion.includes(key)) {
                return answer;
            }
        }

        return null; // Use AI for other questions
    }

    getFallbackAnswer(question) {
        // Check for inappropriate content first
        if (this.containsInappropriateContent(question)) {
            return this.handleInappropriateContent();
        }

        // Use knowledge base default response if available
        if (this.knowledgeBase && this.knowledgeBase.default_response) {
            return this.knowledgeBase.default_response;
        }

        // Fallback to hardcoded response
        const fallbackAnswers = {
            'hi': 'नमस्ते! मैं आपके app का help desk हूं। Ye app authentication ke liye hai. Kya jaanna chahte hain?',
            'hello': 'Hello! Main aapke app ka help desk hun. Ye app authentication ke liye hai. Kuch poochein!',
            'how are you': 'Main bilkul theek hun! Aapke app ki help karne ke liye ready hun. Kya sawal hai?',
            'thanks': 'Most welcome! Aur koi sawal hai toh poochiye. Always ready to help! 😊',
            'bye': 'Bye! Jab bhi help chahiye, main available hun. Take care! 👋',
            'ok': 'Great! Aur koi information chahiye toh poochiye!',
            'good': 'Thank you! Kya specific jaanna chahte hain app ke baare mein?',
            'awesome': 'Thanks! Main yahan hun aapki help karne ke liye. Kya poochna chahte hain?',
            'help': 'Of course! Main help kar sakta hun: authentication, features, login/signup process, API endpoints, security measures, aur technical details.',
            'default': `Ye app ${this.appData?.appInfo?.type || 'React Native app'} hai jo authentication provide karta hai. Main features hain: ${this.appData?.appInfo?.features?.slice(0, 3).join(', ') || 'login, signup, user management'}. Kya specific jaanna chahte hain?`
        };

        const lowerQuestion = question.toLowerCase();
        
        for (const [key, answer] of Object.entries(fallbackAnswers)) {
            if (key === 'default' || lowerQuestion.includes(key)) {
                return answer;
            }
        }
        
        return fallbackAnswers.default;
    }
}

module.exports = SimpleChatService;

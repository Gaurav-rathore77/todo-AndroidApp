const fs = require('fs').promises;
const path = require('path');

// Easy way to add new Q&A to knowledge base
const addNewQuestion = async (category, question, answer, keywords) => {
    try {
        const knowledgeBasePath = path.join(__dirname, '../data/knowledgeBase.json');
        const knowledgeBase = JSON.parse(await fs.readFile(knowledgeBasePath, 'utf8'));
        
        // Add new question to category
        if (knowledgeBase.categories[category]) {
            knowledgeBase.categories[category].questions.push({
                keywords: keywords,
                question: question,
                answer: answer
            });
            
            await fs.writeFile(knowledgeBasePath, JSON.stringify(knowledgeBase, null, 2));
            console.log(`Successfully added question to ${category} category`);
        } else {
            console.log(`Category ${category} not found`);
        }
    } catch (error) {
        console.error('Error adding question:', error);
    }
};

// Example usage:
// addNewQuestion('basic', 'What is the app version?', 'Current app version is 1.0.0 with latest security updates.', ['version', 'app version', 'update']);

module.exports = { addNewQuestion };

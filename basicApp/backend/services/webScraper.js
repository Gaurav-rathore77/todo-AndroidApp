const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class WebScraper {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.ensureDataDir();
    }

    async ensureDataDir() {
        try {
            await fs.access(this.dataDir);
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true });
        }
    }

    async scrapeAppDocumentation() {
        const appData = {
            appInfo: {
                name: "Basic App",
                type: "React Native Expo Application with Authentication",
                description: "Complete authentication system with JWT tokens, form validation, and MongoDB backend. Includes login, signup, protected routes, and user management.",
                features: ["JWT Authentication", "Form Validation", "Protected Routes", "User Management", "MongoDB Integration", "React Native Navigation"]
            },
            components: [],
            apiEndpoints: [],
            codeStructure: []
        };

        // Scrape local files and structure
        await this.scrapeLocalFiles(appData);
        
        // Also scrape AUTH_README for detailed app info
        await this.scrapeAuthReadme(appData);
        
        // Save scraped data
        await this.saveScrapedData(appData);
        
        return appData;
    }

    async scrapeLocalFiles(appData) {
        const rootDir = path.join(__dirname, '../..');
        
        try {
            console.log('Scanning root directory:', rootDir);
            
            // Read package.json for app info
            const packageJsonPath = path.join(rootDir, 'package.json');
            try {
                const packageJson = await fs.readFile(packageJsonPath, 'utf8');
                const packageData = JSON.parse(packageJson);
                appData.appInfo.dependencies = Object.keys(packageData.dependencies || {});
                appData.appInfo.devDependencies = Object.keys(packageData.devDependencies || {});
                console.log('Package.json loaded successfully');
            } catch (error) {
                console.log('Package.json not found, using defaults');
            }

            // Scan app directory structure
            const appDir = path.join(rootDir, 'app');
            try {
                await fs.access(appDir);
                await this.scanDirectory(appDir, appData.codeStructure, 'app');
                console.log('App directory scanned successfully');
            } catch (error) {
                console.log('App directory not found, skipping');
            }
            
            // Scan backend directory structure
            const backendDir = path.join(rootDir, 'backend');
            try {
                await fs.access(backendDir);
                await this.scanDirectory(backendDir, appData.codeStructure, 'backend');
                console.log('Backend directory scanned successfully');
            } catch (error) {
                console.log('Backend directory not found, skipping');
            }

            // Extract component information
            const componentsDir = path.join(rootDir, 'components');
            try {
                await fs.access(componentsDir);
                await this.extractComponents(componentsDir, appData.components);
                console.log('Components extracted successfully');
            } catch (error) {
                console.log('Components directory not found, skipping');
            }

            // Extract API endpoints
            const routesDir = path.join(rootDir, 'backend/routes');
            try {
                await fs.access(routesDir);
                await this.extractApiEndpoints(routesDir, appData.apiEndpoints);
                console.log('API endpoints extracted successfully');
            } catch (error) {
                console.log('Routes directory not found, skipping');
            }

        } catch (error) {
            console.error('Error scraping local files:', error);
        }
    }

    async scrapeAuthReadme(appData) {
        try {
            const readmePath = path.join(__dirname, '../AUTH_README.md');
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            
            // Extract features from README
            const features = [];
            if (readmeContent.includes('JWT Authentication')) features.push('JWT Authentication');
            if (readmeContent.includes('Form Validation')) features.push('Form Validation');
            if (readmeContent.includes('Protected Routes')) features.push('Protected Routes');
            if (readmeContent.includes('User Management')) features.push('User Management');
            if (readmeContent.includes('MongoDB Integration')) features.push('MongoDB Integration');
            if (readmeContent.includes('React Native Navigation')) features.push('React Native Navigation');
            
            appData.appInfo.features = features;
            
            // Extract API endpoints
            const apiMatches = readmeContent.match(/\| POST \| `\/api\/auth\/([^`]+)`\| ([^|]+)/g);
            if (apiMatches) {
                apiMatches.forEach(function(match) {
                    const parts = match.split('|');
                    if (parts.length >= 3) {
                        const endpoint = parts[1];
                        const description = parts[2];
                        appData.apiEndpoints.push({
                            method: 'POST',
                            path: '/api/auth/' + endpoint,
                            description: description.trim(),
                            file: 'auth.js'
                        });
                    }
                });
            }
            
            console.log('Scraped AUTH_README.md successfully');
        } catch (error) {
            console.error('Error scraping AUTH_README.md:', error);
        }
    }

    async scanDirectory(dirPath, structure, prefix) {
        try {
            console.log('Scanning directory:', dirPath);
            const items = await fs.readdir(dirPath);
            console.log('Found items:', items.length);
            
            for (const item of items) {
                // Skip node_modules and other common ignore directories
                if (item === 'node_modules' || item === '.git' || item === '.expo') {
                    continue;
                }
                
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                
                if (stats.isDirectory()) {
                    structure.push({
                        type: 'directory',
                        name: item,
                        path: path.join(prefix, item),
                        children: []
                    });
                    await this.scanDirectory(itemPath, structure[structure.length - 1].children, path.join(prefix, item));
                } else {
                    // Only read text files, skip binaries
                    const ext = path.extname(item).toLowerCase();
                    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.css', '.html'];
                    
                    if (textExtensions.includes(ext)) {
                        try {
                            const content = await fs.readFile(itemPath, 'utf8');
                            structure.push({
                                type: 'file',
                                name: item,
                                path: path.join(prefix, item),
                                size: stats.size,
                                language: this.getLanguage(item),
                                preview: content.substring(0, 500) + (content.length > 500 ? '...' : '')
                            });
                        } catch (fileError) {
                            console.log('Skipping binary file:', item);
                        }
                    } else {
                        structure.push({
                            type: 'file',
                            name: item,
                            path: path.join(prefix, item),
                            size: stats.size,
                            language: this.getLanguage(item),
                            preview: `[Binary file: ${ext}]`
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error scanning directory:', dirPath, error);
        }
    }

    async extractComponents(componentsDir, components) {
        try {
            const files = await fs.readdir(componentsDir);
            
            for (const file of files) {
                if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                    const filePath = path.join(componentsDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // Extract component info using regex
                    const componentMatch = content.match(/(?:function|const)\s+(\w+).*?React\.FC|React\.Component|export default/);
                    const propsMatch = content.match(/interface\s+(\w+Props)|(?:const|function)\s+\w+\s*\(\s*([^}]+)/);
                    
                    components.push({
                        name: componentMatch ? componentMatch[1] : file.replace(/\.(js|jsx|ts|tsx)$/, ''),
                        file: file,
                        props: propsMatch ? propsMatch[2] || propsMatch[1] : 'unknown',
                        usage: this.extractUsage(content)
                    });
                }
            }
        } catch (error) {
            console.error('Error extracting components:', error);
        }
    }

    async extractApiEndpoints(routesDir, endpoints) {
        try {
            const files = await fs.readdir(routesDir);
            
            for (const file of files) {
                if (file.endsWith('.js')) {
                    const filePath = path.join(routesDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // Extract API endpoints
                    const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
                    
                    if (routeMatches) {
                        routeMatches.forEach(match => {
                            const methodMatch = match.match(/(get|post|put|delete|patch)/);
                            const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
                            
                            if (methodMatch && pathMatch) {
                                endpoints.push({
                                    method: methodMatch[1].toUpperCase(),
                                    path: pathMatch[1],
                                    file: file,
                                    description: this.extractEndpointDescription(content, pathMatch[1])
                                });
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error extracting API endpoints:', error);
        }
    }

    extractUsage(content) {
        const usage = [];
        
        // Extract hooks usage
        const hooks = content.match(/use\w+/g);
        if (hooks) usage.push(...hooks);
        
        // Extract imports
        const imports = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g);
        if (imports) usage.push(...imports);
        
        return usage.slice(0, 5); // Limit to first 5 usages
    }

    extractEndpointDescription(content, path) {
        // Look for comments near the endpoint
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(path)) {
                // Check previous lines for comments
                for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                    if (lines[j].includes('//')) {
                        return lines[j].replace('//', '').trim();
                    }
                }
            }
        }
        return 'No description available';
    }

    getLanguage(filename) {
        const ext = path.extname(filename);
        const langMap = {
            '.js': 'JavaScript',
            '.jsx': 'React JSX',
            '.ts': 'TypeScript',
            '.tsx': 'React TSX',
            '.json': 'JSON',
            '.md': 'Markdown',
            '.css': 'CSS',
            '.html': 'HTML'
        };
        return langMap[ext] || 'Unknown';
    }

    async saveScrapedData(data) {
        try {
            await fs.writeFile(
                path.join(this.dataDir, 'appData.json'),
                JSON.stringify(data, null, 2)
            );
            console.log('App data saved successfully');
        } catch (error) {
            console.error('Error saving scraped data:', error);
        }
    }

    async getScrapedData() {
        try {
            const data = await fs.readFile(path.join(this.dataDir, 'appData.json'), 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading scraped data:', error);
            return null;
        }
    }

    async getStats() {
        try {
            const data = await this.getScrapedData();
            return {
                totalDocuments: this.documents ? this.documents.length : 0,
                documentTypes: this.documents ? this.documents.reduce((acc, doc) => {
                    acc[doc.metadata.type] = (acc[doc.metadata.type] || 0) + 1;
                    return acc;
                }, {}) : {}
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalDocuments: 0,
                documentTypes: {}
            };
        }
    }
}

module.exports = WebScraper;

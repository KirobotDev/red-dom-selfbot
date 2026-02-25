const fs = require('fs').promises;
const path = require('path');

class EventCache {
    constructor() {
        this.eventFiles = new Map();
        this.loadedEvents = new Map();
    }

    async loadEventFile(filePath) {
        if (this.eventFiles.has(filePath)) {
            return this.eventFiles.get(filePath);
        }

        try {
            const eventModule = require(filePath);
            this.eventFiles.set(filePath, eventModule);
            return eventModule;
        } catch (error) {
            console.error('Erreur chargement event:', error);
            throw error;
        }
    }

    async attachEventsToClient(client) {
        try { 
             
            client.removeAllListeners();
            
            const eventsDir = path.resolve(__dirname, 'events'); 
             
            const subDirs = await fs.readdir(eventsDir); 
            
            let totalEvents = 0;
            
            for (const dir of subDirs) {
                const dirPath = path.join(eventsDir, dir);
                const stat = await fs.stat(dirPath);
                
                if (stat.isDirectory()) { 
                    
                    const eventFiles = (await fs.readdir(dirPath)).filter(f => f.endsWith(".js")); 
                    
                    for (const file of eventFiles) {
                        const filePath = path.join(dirPath, file);
                        const eventName = file.split('.')[0];
                        
                        try {
                            const evt = await this.loadEventFile(filePath); 
                            const eventHandler = evt.run || evt.execute;
                            const eventActualName = evt.name || eventName;
                            
                            if (!eventHandler) { 
                                continue;
                            }
                            
                            if (evt.once) {
                                client.once(eventActualName, (...args) => eventHandler(...args, client));
                            } else {
                                client.on(eventActualName, (...args) => eventHandler(...args, client));
                            }
                            
                            totalEvents++; 
                            
                        } catch (error) {
                            console.error(`     ❌ Erreur ${eventName}:`, error.message);
                        }
                    }
                }
            } 
            
            return totalEvents;
            
        } catch (error) {
            console.error('❌ Erreur chargement événements:', error.message);
            return 0;
        }
    }

    clearCache() { 
        for (const [filePath] of this.eventFiles) {
            delete require.cache[require.resolve(filePath)];
        }
        this.eventFiles.clear();
    }
}
 
module.exports = new EventCache();
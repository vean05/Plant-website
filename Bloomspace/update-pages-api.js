/**
 * Update Pages API Integration
 * Script to add API integration to all main pages
 */

const fs = require('fs');
const path = require('path');

// List of main pages to update
const mainPages = [
    'plant-gifts.html',
    'care-tools.html',
    'artificial-plant.html',
    'new-arrivals.html',
    'growlight.html',
    'planters.html',
    'events.html',
    'product-detail.html',
    'checkout.html',
    'login.html',
    'get10.html'
];

// Scripts to add
const apiScripts = [
    '<script src="api-integration.js?v=1.0"></script>',
    '<script src="universal-api-loader.js?v=1.0"></script>'
];

function updatePage(pageName) {
    const filePath = path.join(__dirname, pageName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${pageName}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if API scripts are already present
        if (content.includes('api-integration.js')) {
            console.log(`✅ ${pageName} already has API integration`);
            return true;
        }
        
        // Find the script section and add API scripts
        const scriptPattern = /<script src="script\.js[^"]*"><\/script>/;
        const match = content.match(scriptPattern);
        
        if (match) {
            const scriptTag = match[0];
            const apiScriptsHTML = apiScripts.join('\n    ');
            const replacement = `${scriptTag}\n    ${apiScriptsHTML}`;
            
            content = content.replace(scriptTag, replacement);
            
            // Write back to file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${pageName}`);
            return true;
        } else {
            console.log(`❌ No script.js found in ${pageName}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error updating ${pageName}: ${error.message}`);
        return false;
    }
}

// Update all pages
console.log('🔄 Updating pages with API integration...');
let successCount = 0;

mainPages.forEach(page => {
    if (updatePage(page)) {
        successCount++;
    }
});

console.log(`\n✅ Updated ${successCount}/${mainPages.length} pages successfully`);

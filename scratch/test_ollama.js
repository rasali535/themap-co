
async function test() {
    const url = 'http://127.0.0.1:11434/api/tags';
    console.log(`Testing connection to ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Found ${data.models.map(m => m.name).join(', ')}`);
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

test();

// Quick script to test the AI wrapper endpoints
// Run: npx ts-node src/test-token.ts

console.log("\n📡 AI Wrapper Test Commands\n");
console.log("─────────────────────────────────────────\n");

console.log(`1) Health check:`);
console.log(`   curl http://localhost:4001/health\n`);

console.log(`2) Suggest Theme:`);
console.log(`   curl -X POST http://localhost:4001/api/ai/suggest-theme ^`);
console.log(`     -H "Content-Type: application/json" ^`);
console.log(`     -d "{\\"description\\":\\"A modern coffee shop in downtown NYC\\",\\"businessType\\":\\"restaurant\\"}"\n`);

console.log(`3) Improve Component:`);
console.log(`   curl -X POST http://localhost:4001/api/ai/improve-component ^`);
console.log(`     -H "Content-Type: application/json" ^`);
console.log(`     -d "{\\"componentId\\":\\"hero_with_cta\\",\\"currentProps\\":{\\"heading\\":\\"Welcome\\",\\"subheading\\":\\"We are here\\",\\"buttonLabel\\":\\"Click\\"},\\"instruction\\":\\"Make it more engaging\\",\\"businessContext\\":{\\"businessName\\":\\"Sunrise Cafe\\",\\"description\\":\\"A cozy coffee shop\\",\\"businessType\\":\\"restaurant\\"}}"\n`);

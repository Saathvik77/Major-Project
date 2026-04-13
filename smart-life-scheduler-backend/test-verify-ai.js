console.log("STARTING TEST...");
const path = require('path');

// Mocking function
const mockModel = (relPath, exports) => {
  const absPath = path.resolve(__dirname, relPath);
  console.log(`Mocking ${absPath}`);
  require.cache[absPath] = {
    id: absPath,
    filename: absPath,
    loaded: true,
    exports: exports
  };
  // Also mock without extension just in case
  require.cache[absPath.replace(/\.js$/, '')] = require.cache[absPath];
};

mockModel('models/User.js', {
  findById: async () => ({
    _id: 'testuser',
    aiContext: {},
    save: async () => {},
    markModified: () => {}
  })
});

mockModel('models/Task.js', {
  find: async () => [],
  create: async (data) => data,
  insertMany: async (tasks) => tasks
});

console.log("MOCKS READY. LOADING CONTROLLER...");
try {
  const aiController = require('./controllers/aiController');
  console.log("CONTROLLER LOADED.");

  const mockRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.data = data; console.log("RESPONSE:", JSON.stringify(data, null, 2)); }
  };

  const testPrompts = [
    "reccomond some movies",
    "show me movies",
    "suggest some music",
    "give me book recommendations",
    "show me dashboard"
  ];

  async function runTests() {
    for (const prompt of testPrompts) {
      console.log(`\nTESTING: "${prompt}"`);
      const req = {
        body: { message: prompt },
        user: { _id: 'testuser' }
      };
      await aiController.chatWithAI(req, mockRes);
    }
    console.log("\nALL TESTS COMPLETE.");
    process.exit(0);
  }

  runTests();
} catch (err) {
  console.error("FATAL ERROR:", err);
  process.exit(1);
}

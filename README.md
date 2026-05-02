# GitHub Candidate Finder (MCP Server)

An MCP (Model Context Protocol) server designed to help AI agents (like Claude or Cursor) find and rank high-signal engineering candidates on GitHub. This server is optimized to provide deep candidate evaluation while strictly adhering to unauthenticated API rate limits.

---

## 🚀 Capabilities

- **Geographical Discovery:** Search for candidates in specific locations (e.g., "Sri Lanka").
- **Language-Specific Expertise:** Filters and ranks candidates based on their actual codebase contributions to a target language.
- **Intelligent Scoring Engine:**
  - **Hard Language Filter:** Automatically excludes or deprioritizes candidates who do not have repositories in the requested language.
  - **Weighted Peer Validation:** Repository stars in the target language count double, while general stars show overall competence.
  - **Recency Bonus:** Multiplier for candidates who have pushed code within the last 90 days.
- **AI-Optimized Output:** Returns shaped JSON or Markdown reasoning specifically designed for an AI agent's context window.

---

## 📸 Technical Preview

### MCP Inspector Tool Definition
![MCP Inspector Tools Interface](https://github.com/J33WAKASUPUN/GitHub-Candidate-Finder/blob/main/server/screenshots/screenshot-1.jpg)
*Defining the `find_engineering_candidates` tool with strict input schemas for location, language, and evaluation limits.*

### Live Tool Execution & Result Shaping
![MCP Inspector Execution Results](https://github.com/J33WAKASUPUN/GitHub-Candidate-Finder/blob/main/server/screenshots/screenshot-2.jpg)
*The server executing a live search for TypeScript engineers in Sri Lanka, returning ranked and scored results.*

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **GitHub Personal Access Token** *(Optional, but recommended to avoid the 60 req/hr limit)*

### Installation

```bash
# Clone the repository
git clone https://github.com/J33WAKASUPUN/GitHub-Candidate-Finder.git
cd server

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory:

```plaintext
GITHUB_TOKEN=your_github_personal_access_token_here
```

### Running the Server

```bash
# Build the TypeScript project
npm run build

# Start the server (Production mode)
node dist/index.js

# Development mode (with hot-reloading)
npm run dev
```

---

## 🧪 Testing

### Automated Unit Tests

The project includes a Jest suite to validate the ranking math (handling stars, recency, and language filters).

```bash
npm run test
```

### Manual Testing with MCP Inspector

You can simulate an AI agent's interaction using the official MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## 📊 Sample Output

When the tool is called (e.g., for TypeScript engineers in Sri Lanka), it returns a ranked list like this:

```json
[
  {
    "username": "gihan667",
    "github_url": "https://github.com/gihan667",
    "score": 314,
    "target_repo_count": 3,
    "top_language_stars": 97,
    "reasoning": "Scored 314. Found 3 repos in TypeScript with 97 stars. Last active 191 days ago.",
    "last_active": "2025-10-23T15:09:40.000Z"
  },
  {
    "username": "SasadaSaumya",
    "github_url": "https://github.com/SasadaSaumya",
    "score": 54,
    "target_repo_count": 2,
    "top_language_stars": 4,
    "reasoning": "Scored 54. Found 2 repos in TypeScript with 4 stars. Last active 26 days ago.",
    "last_active": "2026-04-06T15:24:40.000Z"
  },
  {
    "username": "University-Of-Sri-Jayewardenepura",
    "github_url": "https://github.com/University-Of-Sri-Jayewardenepura",
    "score": 38,
    "target_repo_count": 1,
    "top_language_stars": 1,
    "reasoning": "Scored 38. Found 1 repos in TypeScript with 1 stars. Last active 28 days ago.",
    "last_active": "2026-04-04T17:50:59.000Z"
  }
]
```

---

## 🧠 Design Decisions & Accomplishments

**Solving the N+1 Rate Limit Problem:** To respect the 60 requests/hour limit, the server uses a "slicing" strategy. It fetches the top matches from GitHub first, then performs deep repository analysis only on the most relevant candidates. This keeps API consumption deterministic.

**Hard Language Requirement:** Implemented a filter that ensures a "strong" engineer in JavaScript doesn't accidentally rank #1 for a Go role just because of general star counts. The candidate must show evidence of the target language to score.

**Strict ESM Implementation:** Built using modern TypeScript ESM (NodeNext) to ensure compatibility with the latest Model Context Protocol SDK and Node.js standards.

**Error Resilience:** The server handles "noisy" stdout from dependency warnings (like experimental loaders) by separating build/run steps, ensuring the JSON-RPC stream between the server and the AI remains clean.

---

## 🏁 Conclusion

This MCP server demonstrates a production-oriented approach to building AI tools. By prioritizing data relevance and rate-limit safety, it provides AI agents with a reliable "intelligence layer" for talent discovery. The modular scoring logic and strict adherence to protocol standards ensure that it is not only functional but also extensible for more complex recruitment workflows in the future.

// server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode, } from "@modelcontextprotocol/sdk/types.js";
import { searchGitHubUsers, getUserRepos } from "./github.js";
import { rankCandidates } from "./ranking.js";
// Initialize the MCP Server
const server = new Server({
    name: "github-candidate-finder",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 1. Define the Tool Schema for the AI Agent
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "find_engineering_candidates", // Required tool name
                description: "Finds and ranks strong GitHub engineers based on location, programming language, and recent activity.",
                inputSchema: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "The location of the engineer (e.g., 'Sri Lanka').",
                        },
                        language: {
                            type: "string",
                            description: "The primary programming language they write (e.g., 'Go', 'TypeScript').",
                        },
                        limit: {
                            type: "number",
                            description: "The number of candidates to evaluate and return (max 10 to save rate limits). Defaults to 5.",
                        },
                    },
                    required: ["location", "language"],
                },
            },
        ],
    };
});
// 2. Execute the Tool Logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "find_engineering_candidates") {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
    // Type cast the arguments
    const args = request.params.arguments;
    const location = args.location;
    const language = args.language;
    // Hard cap the limit at 10 to protect our API limit constraint
    const limit = Math.min(args.limit || 5, 10);
    try {
        // Step 1: Search for top 'N' users
        const users = await searchGitHubUsers(location, language, limit);
        if (users.length === 0) {
            return {
                content: [{ type: "text", text: "No candidates found for that location and language." }],
            };
        }
        // Step 2: Fetch repos for these specific users concurrently
        const candidatesWithRepos = await Promise.all(users.map(async (user) => {
            const repos = await getUserRepos(user.login);
            return { user, repos };
        }));
        // Step 3: Rank them using our scoring engine
        const rankedCandidates = rankCandidates(candidatesWithRepos, language);
        // Step 4: Return formatted JSON to the AI Agent
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(rankedCandidates, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("Tool execution failed:", error);
        throw new McpError(ErrorCode.InternalError, "Failed to fetch and rank candidates.");
    }
});
// 3. Start the Server over standard input/output
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub Candidate Finder MCP server running on stdio");
}
main().catch(console.error);

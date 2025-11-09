# GitDiagram - Visualizing MasterCook Architecture

This guide explains how to use [GitDiagram](https://github.com/ahmedkhaleel2004/gitdiagram) by Ahmed Kalheel to visualize the MasterCook repository as an interactive architecture diagram.

## What is GitDiagram?

GitDiagram is a tool that converts any GitHub repository into an interactive system design/architecture diagram. It analyzes your repository structure and README to generate a visual representation using Mermaid.js diagrams powered by OpenAI.

### Key Features:
- 👀 **Instant Visualization**: Convert repository structure into diagrams in seconds
- 🎨 **Interactive Components**: Click on diagram components to navigate to source files
- ⚡ **AI-Powered**: Uses OpenAI o4-mini for quick and accurate diagram generation
- 🔄 **Customizable**: Modify and regenerate diagrams with custom instructions
- 🔒 **Privacy Options**: Support for both public and private repositories

## Quick Start - Using GitDiagram Web Service

### Method 1: Direct Web Access

Visit the GitDiagram website with this repository:

```
https://gitdiagram.com/?repo=https://github.com/CJavSM/Master
```

Or simply go to [gitdiagram.com](https://gitdiagram.com/) and enter the repository URL:
```
https://github.com/CJavSM/Master
```

### Method 2: URL Trick

Replace `github.com` with `gitdiagram.com` in any GitHub URL:

**Original URL:**
```
https://github.com/CJavSM/Master
```

**GitDiagram URL:**
```
https://gitdiagram.com/CJavSM/Master
```

This works for any GitHub repository URL!

## Understanding the Generated Diagram

The diagram will show:

- **Microservices Architecture**: The backend services (auth-service, booking-service, payment-service, workshops-service)
- **API Gateway**: How the API gateway connects to services
- **Frontend**: React/TypeScript frontend application
- **Database**: MySQL database integration
- **Docker Services**: The containerized architecture from docker-compose.yml

### Interactive Features

- Click on any component in the diagram to navigate directly to:
  - Source code files
  - Service directories
  - Configuration files
  - Documentation

## Self-Hosting GitDiagram (Optional)

If you need more control or want to work with private repositories without sharing tokens, you can self-host GitDiagram locally.

### Prerequisites

- Node.js (pnpm package manager)
- Docker and Docker Compose
- OpenAI API key
- (Optional) GitHub Personal Access Token for private repos

### Installation Steps

1. **Clone GitDiagram repository**
```bash
git clone https://github.com/ahmedkhaleel2004/gitdiagram.git
cd gitdiagram
```

2. **Install dependencies**
```bash
pnpm i
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit the `.env` file and add:
- Your OpenAI API key
- (Optional) GitHub Personal Access Token with `repo` scope

4. **Start the backend**
```bash
docker-compose up --build -d
```

The FastAPI backend will be available at `localhost:8000`

5. **Initialize the database**
```bash
chmod +x start-database.sh
./start-database.sh
pnpm db:push
```

6. **Run the frontend**
```bash
pnpm dev
```

7. **Access your local instance**

Navigate to `http://localhost:3000` and enter:
```
https://github.com/CJavSM/Master
```

## Using with Private Repositories

If this repository becomes private, you have two options:

### Option 1: Use GitDiagram with Personal Access Token

1. Go to [gitdiagram.com](https://gitdiagram.com/)
2. Click on "Private Repos" in the header
3. Generate a GitHub Personal Access Token with `repo` scope:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Click "Generate new token (classic)"
   - Select the `repo` scope
   - Copy the generated token
4. Paste the token in GitDiagram
5. Enter the repository URL

### Option 2: Self-Host Locally

Follow the self-hosting steps above and configure your GitHub token in the `.env` file.

## Benefits for MasterCook Project

Using GitDiagram for MasterCook helps:

1. **Onboarding New Developers**: Quickly understand the microservices architecture
2. **Documentation**: Visual complement to written documentation
3. **Architecture Review**: See the system design at a glance
4. **Code Navigation**: Jump directly to relevant services and files
5. **Stakeholder Communication**: Share visual architecture with non-technical stakeholders

## Customization Options

When using GitDiagram, you can:

- **Add Custom Instructions**: Provide specific details about what to highlight
- **Regenerate**: Modify the diagram with different focus areas
- **Export**: Save the generated Mermaid.js code for your own documentation

## Resources

- GitDiagram Website: https://gitdiagram.com/
- GitDiagram GitHub: https://github.com/ahmedkhaleel2004/gitdiagram
- Creator: Ahmed Kalheel [@ahmedkhaleel2004](https://github.com/ahmedkhaleel2004)
- MasterCook Repository: https://github.com/CJavSM/Master

## Tips for Best Results

1. **Keep README Updated**: GitDiagram uses your README.md to understand the project structure
2. **Use Descriptive Folder Names**: Clear naming helps AI generate better diagrams
3. **Add Architecture Documentation**: More context in docs leads to better diagrams
4. **Try Custom Instructions**: Specify what aspects to emphasize (e.g., "Focus on service communication")

## Troubleshooting

- **Diagram takes too long**: Large repositories may take 30-60 seconds
- **Missing components**: Ensure your README describes the architecture
- **Private repo access issues**: Verify your GitHub token has correct permissions
- **Self-hosted issues**: Check Docker logs with `docker-compose logs -f`

---

**Note**: GitDiagram is an external tool and requires an active internet connection to generate diagrams. For sensitive codebases, consider using the self-hosted option.

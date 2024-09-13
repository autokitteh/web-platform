# 🐾 AutoKitteh

## Overview 🌟

[AutoKitteh](https://www.autokitteh.com) is an open-source, developer-first framework aimed at simplifying the automation of distributed systems. It supports various deployment models including on-prem, cloud, and hybrid systems.

## Key Features 🔑

-   **Automation as Code**: Focus on writing automation scripts.
-   **Versatile Deployment**: Compatible with on-prem, cloud, and hybrid environments.
-   **Integrated Tools**: Includes API connectivity, debugging, monitoring, and error handling features.

## Use Cases 🚀

-   **DevOps Automation**: Automate workflows with tools like GitHub, Slack, Jira, etc.
-   **Cybersecurity - SOAR**: Develop Security Orchestration, Automation, and Response tools.
-   **Work and Marketing Automation**: Facilitate tasks using systems like Gmail, Docs, Slack, Calendar, etc.
-   **Corporate Operations Automation**: Enhance enterprise-specific procedures for HR, sales, etc.

## Contact 📬

For inquiries, contact: meow@autokitteh.com

# Contributing to autokitteh

We'd love to get your input! We want to make contributing to this project as easy and transparent as possible.

## How to Install and Run 🛠️

### Prerequisites 📋

Ensure you have the following installed on your system:

-   **Node.js** (version 16.x or later)
-   **npm** (version 7.x or later)
-   **Git** (for version control and repository management)

### Installation Steps 🚀

1.  **Clone the Repository**:

    `git clone https://github.com/autokitteh/web-platform && cd autokitteh`

2.  **Get AutoKitteh Submodule**: Use git to install the AutoKitteh submodule:

    `git submodule update --remote`

3.  **Install Dependencies**: Use npm to install all the required dependencies:

    `npm install`

### Environment Setup 🌐

Create a `.env` file in the root of the project directory and add the necessary environment variables. Refer to the `validateEnv` script for required variables: `sh cp .env.example .env # Edit .env with your environment-specific settings`

### Running the Project 🏃

1.  **Development Mode**: Start the development server with hot reloading.

    `npm run dev`

2.  **Building the Project**: Create a production-ready build.

    `npm run build`

3.  **Preview the Build**: Serve the production build locally to ensure everything is working as expected.

    `npm run preview`

### Testing 🧪

1.  **Run Unit Tests**: Execute the test suite.

    `npm run test`

2.  **Run End-to-End Tests**: Run the Playwright end-to-end tests.

    `npm run test:e2e`

3.  **View E2E Test UI**: Launch the Playwright test runner UI.

    `npm run test:e2e:ui`

4.  **Generate E2E Test Report**: Generate and view the test report.

    `npm run test:e2e:report`

### Linting and Formatting 🧹

1.  **Lint the Code**: Lint the codebase to ensure code quality.

    `npm run lint`

2.  **Fix Linting Issues**: Automatically fix linting issues where possible.

    `npm run lint-fix`

3.  **Check Code Formatting**: Check if the code meets the formatting standards.

    `npm run prettier`

4.  **Fix Code Formatting**: Automatically format the codebase.

    `npm run fixed-format:staged`

### Additional Commands 📜

1.  **Type Checking**: Perform type checking without emitting output files and compile the project.

    `npm run type-check`

2.  **Storybook**: Launch the Storybook development environment.

    `npm run storybook`

3.  **Tailwind Config Viewer**: Open the Tailwind CSS configuration viewer.

    `npm run tailwind-config-viewer`

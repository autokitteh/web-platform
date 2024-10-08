# 🐾 AutoKitteh - Web UI

## Overview 🌟

[AutoKitteh](https://www.autokitteh.com) is an open-source, developer-first framework aimed at simplifying the automation of distributed systems. It supports various deployment models including on-prem, cloud, and hybrid systems.

This repository contains the web UI for the AutoKitteh backend. The application allows users to create projects from a list of templates or start blank projects. It provides functionality to manage project entities such as code files, connections, triggers, and variables. Users can build and deploy projects on the server, view a list of deployments, and monitor sessions within those deployments. This interface facilitates the process of working with AutoKitteh, making it easier to develop, manage, and deploy automation projects.

![Screenshot 2024-10-07 at 17 08 57](https://github.com/user-attachments/assets/3ea42fbd-f74d-4b00-b0d4-dd3b40ea12ee)

## How to run the application using Docker Compose 🐳

Use the following command to run the application with Docker

-   `docker compose -f development.compose.yml up`

## How to Install and Run ⚙️

### Prerequisites 📋

Ensure you have the following installed on your system:

-   **Node.js** (version 16.x or later)
-   **npm** (version 7.x or later)
-   **Git** (for version control and repository management)

### Installation Steps 🚀

1.  **Clone the Repository**:

    `git clone https://github.com/autokitteh/web-platform && cd autokitteh`

2.  **Get AutoKitteh Submodule**: Use git to install the AutoKitteh submodule:

    `git submodule update --init`

3.  **Install Dependencies**: Use npm to install all the required dependencies:

    `npm install`

### Environment Setup 🌐

Create a `.env` file in the root of the project directory and add the necessary environment variables. Refer to the `validateEnv` script for required variables:

`sh cp .env.example .env # Edit .env with your environment-specific settings`

### Running the Project 🏃

1.  **Development Mode**: Start the development server with hot reloading.

    `npm run dev`

2.  **Building the Project**: Create a production-ready build.

    `npm run build`

3.  **Preview the Build**: Serve the production build locally to ensure everything is working as expected.

    `npm run preview`

### Testing 🧪

1.  **Run End-to-End Tests**: Run the Playwright end-to-end tests.

    `npm run test:e2e`

2.  **View E2E Test UI**: Launch the Playwright test runner UI.

    `npm run test:e2e:ui`

3.  **Generate E2E Test Report**: Generate and view the test report.

    `npm run test:e2e:report`

### Additional Commands 📜

1.  **Storybook**: Launch the Storybook development environment.

    `npm run storybook`

2.  **Tailwind Config Viewer**: Open the Tailwind CSS configuration viewer.

    `npm run tailwind-config-viewer`

## Tools We Used 🛠️

In this project we used:

-   [FontAwesome](https://fontawesome.com) our icons.

## Contact 📬

For inquiries, contact: meow@autokitteh.com

## How to Contribute 🤝

To contribute to AutoKitteh, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

We appreciate contributions from everyone!

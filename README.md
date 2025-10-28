# 🐾 AutoKitteh - Web UI

## Overview 🌟

[AutoKitteh](https://www.autokitteh.com) is an open-source, developer-first framework aimed at simplifying the automation of distributed systems. It supports various deployment models including on-prem, cloud, and hybrid systems.

This repository contains the web UI for the AutoKitteh backend. The application allows users to create projects from a list of templates or start blank projects. It provides functionality to manage project entities such as code files, connections, triggers, and variables. Users can build and deploy projects on the server, view a list of deployments, and monitor sessions within those deployments. This interface facilitates the process of working with AutoKitteh, making it easier to develop, manage, and deploy automation projects.

![Screenshot 2024-10-13 at 17 51 54](https://github.com/user-attachments/assets/8454bbf4-d31b-4119-840b-e7c16c945315)

## How to run the application using Docker Compose 🐳

Use the following command to run the application with Docker

- `docker compose -f development.compose.yml up`

## How to Install and Run ⚙️

### Prerequisites 📋

Ensure you have the following installed on your system:

- **Node.js** (version 16.x or later)
- **npm** (version 7.x or later)
- **Git** (for version control and repository management)

### Installation Steps 🚀

1.  **Clone the Repository**:

    `git clone https://github.com/autokitteh/web-platform && cd autokitteh`

2.  **Get AutoKitteh Submodule**: Use git to install the AutoKitteh submodule:

    `git submodule update --init`

3.  **Install Dependencies**: Use npm to install all the required dependencies:

    `npm install`

### Environment Setup 🌐

Create a `.env` file in the root of the project directory and add the necessary environment variables.

`sh cp .env.example .env` Then edit .env with your environment-specific settings

`VITE_HOST_URL`

- Default: A predefined default host URL mentioned in [getApiBaseUrlFile](https://github.com/autokitteh/web-platform/blob/main/src/utilities/getApiBaseUrl.utils.ts)
- Description: Defines the backend URL that the application will use as its host. If not set, the application will use a default host URL.
- Example: VITE_HOST_URL=http://localhost:1234

`VITE_DESCOPE_PROJECT_ID`

- Default: None
- Description: Determines whether the application should restrict access to logged-in users or users with a valid JWT token. Required for authentication using Descope. You need to provide your Descope project ID here to enable authentication protection.
- Example: VITE_DESCOPE_PROJECT_ID=your_descope_project_id

`TESTS_JWT_AUTH_TOKEN`

- Default: None
- Description: Used for running E2E tests when authentication is enabled on the backend. This JWT token allows the test runner to authenticate and access the application during testing.
- Example: TESTS_JWT_AUTH_TOKEN=your_jwt_auth_token_for_e2e_tests

`VITE_DISABLE_MKCERT_SSL`

- Default: None (SSL certificates are enabled by default)
- Description: When set to "true", disables automatic SSL certificate generation via mkcert. This forces the development server to use HTTP instead of HTTPS and restricts SSL certificates to localhost only.
- Example: VITE_DISABLE_MKCERT_SSL=true

**Note:** These environment variables are optional. The application will use default values or fall back to certain behaviors if these variables are not set. However, setting them allows for greater customization and functionality, especially in different deployment environments or when running tests.

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

### Testing GitHub Actions Locally

You can run GitHub Actions workflows locally using [Act](https://github.com/nektos/act):

1.  **Install Act**: 
    ```bash
    # macOS
    brew install act
    
    # Linux/Windows
    # See: https://github.com/nektos/act#installation
    ```

2.  **Run workflows**: The project includes an `.actrc` configuration file for Act.
    ```bash
    # Run all workflows
    act
    
    # Run specific workflow
    act -W .github/workflows/workflow-name.yml
    
    # Run specific job with secrets and variables
    act --workflows .github/workflows/build_test_and_release.yml --job test --secret-file .secrets --var-file .vars --container-options "--privileged"
    
    # List available workflows
    act -l
    ```

3.  **Environment Variables**: Create `.secrets` and `.vars` files for local testing:
    
    **`.secrets`** (required secrets):
    - `GH_TOKEN` - GitHub personal access token to pull from kittehub repo
    - `VITE_DESCOPE_PROJECT_ID` - Descope project ID to test with backend protected by authentication
    - `TESTS_JWT_AUTH_TOKEN` - JWT token to authenticate with the backend during testing
    - `AK_RSA_PRIVATE_KEY` - RSA private key to run the backend with authentication
    - `AK_RSA_PUBLIC_KEY` - RSA public key to run the backend with authentication
    
    **`.vars`** (required variables):
    - `AUTOKITTEH_IMAGE` - AutoKitteh Docker image to use

## Tools We Used 🛠️

In this project we used:

- [FontAwesome](https://fontawesome.com) and [tabler-icons](https://github.com/tabler/tabler-icons) for our icons.

## Contact 📬

For inquiries, contact: meow@autokitteh.com

## How to Contribute 🤝

To contribute to AutoKitteh, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

We appreciate contributions from everyone!
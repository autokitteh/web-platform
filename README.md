# 🐾 AutoKitteh - Web UI

## Overview 🌟

[AutoKitteh](https://www.autokitteh.com) is an open-source, developer-first framework aimed at simplifying the automation of distributed systems. It supports various deployment models including on-prem, cloud, and hybrid systems.

This repository contains the web UI for the AutoKitteh backend. The application allows users to create projects from a list of templates or start blank projects. It provides functionality to manage project entities such as code files, connections, triggers, and variables. Users can build and deploy projects on the server, view a list of deployments, and monitor sessions within those deployments. This interface facilitates the process of working with AutoKitteh, making it easier to develop, manage, and deploy automation projects.

![Screenshot 2024-10-13 at 17 51 54](https://github.com/user-attachments/assets/8454bbf4-d31b-4119-840b-e7c16c945315)

## How to run the application using Docker  🐳

## Prerequisites

- Docker installed on your machine
- AWS CLI installed and configured with the necessary permissions to access ECR

## Running Docker with Local Files

To build and run the Docker container using your local project files instead of pulling from GitHub:

1. Make the local build script executable:

   ```bash
   chmod +x docker/build-local.sh
   ```

2. Run the local build script from the project root:

   ```bash
   ./docker/build-local.sh
   ```

3. The script will build the Docker image from your local files and prompt you to run it immediately.

4. You can customize the environment variables:

   ```bash
   VITE_HOST_URL=https://api.example.com/ VITE_DESCOPE_PROJECT_ID=your_id ./docker/build-local.sh
   ```

5. To run a previously built local image:

   ```bash
   docker run -p 8080:80 autokitteh-ui:local
   ```

## Building the Docker Image

There are two primary ways to build the Docker image:

### From GitHub Release

To build the Docker image from a GitHub release, run:

```bash
docker build -t autokitteh/ui:latest -f docker/Dockerfile docker/
```

Or for a specific version:

```bash
docker build -t autokitteh/ui:2.169.3 \
  -f docker/Dockerfile \
  --build-arg RELEASE_VERSION=2.169.3 \
  docker/
```

### From Local Source Code

To build the Docker image from your local source code, use the provided build-local.sh script:

```bash
chmod +x docker/build-local.sh
./docker/build-local.sh
```

Or run the Docker build command directly:

```bash
# Make sure you're in the project root directory
docker build -t autokitteh/ui:local \
  -f docker/Dockerfile \
  --build-arg USE_LOCAL_FILES=true \
  .
```

Note: When building from local source, make sure to run the command from the project root directory, not from the docker directory.

## Pushing the Docker Image to ECR

To push the Docker image to the public ECR repository, you can use the provided script. Follow these steps:

1. Make sure you have the necessary permissions to push to the ECR repository.
2. Run the script:

```bash
chmod +x docker/build-and-push.sh
./docker/build-and-push.sh
```

To push a specific version:

```bash
./docker/build-and-push.sh 2.169.3
```

This script will handle logging into ECR, building the image, tagging it, and pushing it to the repository.

## Troubleshooting

Make the scripts executable:

```
chmod +x docker/build-local.sh
chmod +x docker/build-and-push.sh
```

## How to Install and Run ⚙️

### Prerequisites 📋

Ensure you have the following installed on your system:

- **Node.js** (version 16.x or later)
- **npm** (version 7.x or later)
- **Git** (for version control and repository management)

### Installation Steps 🚀

1. **Clone the Repository**:

    `git clone https://github.com/autokitteh/web-platform && cd autokitteh`

2. **Get AutoKitteh Submodule**: Use git to install the AutoKitteh submodule:

    `git submodule update --init`

3. **Install Dependencies**: Use npm to install all the required dependencies:

    `npm install`

### Environment Setup 🌐

Create a `.env` file in the root of the project directory and add the necessary environment variables.

`sh cp .env.example .env` Then edit .env with your environment-specific settings

`VITE_HOST_URL`

- Default: A predefined default host URL mentioned in [getApiBaseUrlFile](https://github.com/autokitteh/web-platform/blob/main/src/utilities/getApiBaseUrl.utils.ts)
- Description: Defines the backend URL that the application will use as its host. If not set, the application will use a default host URL.
- Example: VITE_HOST_URL=<http://localhost:1234>

`VITE_DESCOPE_PROJECT_ID`

- Default: None
- Description: Determines whether the application should restrict access to logged-in users or users with a valid JWT token. Required for authentication using Descope. You need to provide your Descope project ID here to enable authentication protection.
- Example: VITE_DESCOPE_PROJECT_ID=your_descope_project_id

`TESTS_JWT_AUTH_TOKEN`

- Default: None
- Description: Used for running E2E tests when authentication is enabled on the backend. This JWT token allows the test runner to authenticate and access the application during testing.
- Example: TESTS_JWT_AUTH_TOKEN=your_jwt_auth_token_for_e2e_tests

**Note:** These environment variables are optional. The application will use default values or fall back to certain behaviors if these variables are not set. However, setting them allows for greater customization and functionality, especially in different deployment environments or when running tests.

### Running the Project 🏃

1. **Development Mode**: Start the development server with hot reloading.

    `npm run dev`

2. **Building the Project**: Create a production-ready build.

    `npm run build`

3. **Preview the Build**: Serve the production build locally to ensure everything is working as expected.

    `npm run preview`

### Testing 🧪

1. **Run End-to-End Tests**: Run the Playwright end-to-end tests.

    `npm run test:e2e`

2. **View E2E Test UI**: Launch the Playwright test runner UI.

    `npm run test:e2e:ui`

3. **Generate E2E Test Report**: Generate and view the test report.

    `npm run test:e2e:report`

### Additional Commands 📜

1. **Storybook**: Launch the Storybook development environment.

    `npm run storybook`

2. **Tailwind Config Viewer**: Open the Tailwind CSS configuration viewer.

    `npm run tailwind-config-viewer`

## Tools We Used 🛠️

In this project we used:

- [FontAwesome](https://fontawesome.com) and [tabler-icons](https://github.com/tabler/tabler-icons) for our icons.

## Contact 📬

For inquiries, contact: <meow@autokitteh.com>

## How to Contribute 🤝

To contribute to AutoKitteh, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

We appreciate contributions from everyone!

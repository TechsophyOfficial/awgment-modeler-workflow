## About

The following are the features of Workflow Modeler.
* Provides user interface to manage workflows (or) business processes required for applications
* Provides **versioning** of workflows
* Provision to choose forms (built using form modeler) for a **user task** in workflow
* Provision to choose REST API's for a **service task** in workflow
* Following are the operations that can be performed by a user in a tenant from workflow modeler
    * ***Create*** - Create a new workflow
    * ***Edit*** - Update a workflow
    * ***Delete*** - Delete a workflow
    * ***Deploy*** - Deploy a workflow into the workflow engine (**Camunda**)
    * ***Import/Export*** - Import a workflow from file system into the workflow modeler, Export a workflow from workflow modeler to file system
    * ***View DMN*** - view DMN of a workflow
    * ***View workflows*** - View list of workflows
    * ***search workflows*** - Search for workflow by workflow name


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## Docker build and run
docker build . -t awgment-modeler-workflow

docker run -it -p 8181:80 --env-file docker.env awgment-modeler-workflow:latest

curl localhost:8181/model/process/config.json
## Prerequisites

1. Make sure node is installed in your system.

2. Install Yarn using <a href="https://classic.yarnpkg.com/en/docs/install">this</a>.

3. Go to the checked out project folder and run the command `yarn install` 

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build:development`

Builds the app for development (takes .env.development) to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run build:qa`

Builds the app for staging (takes .env.qa) to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run build:production`

Builds the app for production (takes .env.production) to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run typescript`

To check the typescript errors

### `yarn run lint`

To check the eslint errors

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

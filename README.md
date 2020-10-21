# bespin

Welcome to Cloud City!

## Dependencies

For the [Quickstart](https://github.com/rothfels/bespin#Quickstart), you will need:

- [Node.js 12.x](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)
- [Visual Studio Code](https://code.visualstudio.com/download)

Later, to deploy your app you will also need:

- [terraform ^0.12](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- [AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [`jq`](https://stedolan.github.io/jq/download/)
- (Windows only) [`zip`](http://gnuwin32.sourceforge.net/packages/zip.htm)

### nvm

If you've already installed Node but aren't running Node.js 12.x (`node --version`), use `nvm` to install an appropriate version. [Follow their instructions.](https://github.com/nvm-sh/nvm)

```bash
nvm install 12
nvm alias default 12
```

## Quickstart

First, install [the Quickstart dependencies](https://github.com/rothfels/bespin#Dependencies).

### Choose your team slug

Choose a short, alphanumeric [*slug*](https://en.wikipedia.org/wiki/Clean_URL#Slug) for your project. This will be used to identify all the AWS resources created for your project, as well as the public URL for your project. Once you finish the Quickstart, your app will be available at https://**yourteamslug**.cloudcity.computer. **Your slug should be only letters and digits.**

### Get the starter project

Clone and initialize the starter project. You'll need to have `node` and `npm` installed first. See [dependencies](https://github.com/rothfels/bespin#dependencies).

```bash
source <(curl -s https://cs188.cloudcity.computer/app/script/init-project.sh)
```

This will create a directory with the name of your project slug and install the project dependencies.

If you run into an error sourcing the init script above, you may run the steps manually:

```bash
git clone https://github.com/rothfels/bespin.git <your project slug>
cd <your project slug>
rm -rf .git
# <find/replace "bespin" with your project slug>
git init
npm install
```

Open the project directory in VS Code. Install the recommended extensions then reload VS Code.

### Run a local development server

#### Start MySQL & Redis

Your appserver can use a MySQL database and a Redis instance. Start these on your local machine in the background:

```bash
docker-compose up -d
```

#### Compile ts

You must compile TypeScript before it is runnable in a browser. Start a "watch" mode process that compiles your TypeScript as soon as you change it.

```bash
npm run watch
```

#### Run `server.ts`

Open the `Run/Debug` tab in VS Code and choose the `server.ts` run configuration (either works; one will auto-restart your server when you edit code), then hit play.

![image](https://user-images.githubusercontent.com/1095573/94950349-5c4c2900-0497-11eb-8aca-a5e5048be039.png)

Open http://localhost:3000 to see your app.

Open http://localhost:3000/graphql to see your interactive GraphQL API explorer.

Open `Debug Console` in VS Code to see console output.

![image](https://user-images.githubusercontent.com/1095573/94950447-81d93280-0497-11eb-82c5-ae3e374fd2c5.png)

Set breakpoints in the gutter to the left of your code. **Note: these only work on code executing on the server, not in the browser.**

![image](https://user-images.githubusercontent.com/1095573/93257545-dcf9ee00-f751-11ea-9a7a-1f103a3d3c5a.png)


#### Run `server.ts` (fast mode)

Using the run configuration above is good if you want to use breakpoints, but it can be quite slow depending on your computer. The reason is that under the hood it uses `ts-node`, which is like `node` but compiles all your TypeScript first.

There's a faster way. While running `npm run watch`, any change you make to a TypeScript file will automatically generate a new JavaScript. We can run the generated JavaScript through `node` like this:

```bash
npm run start:server
```

Now, every time you modify a TypeScript file we will (quickly) restart the server!

**Note:** if add a new migration, modify your GraphQL schema, or add any `public` resource you will need to stop and re-run the script above.

#### Run React Storybook

The fastest way to develop React components is in an isolated environment using [Storybook](https://storybook.js.org/). The project ships with an example storybook, see `Login.stories.tsx` or `Survey.stories.tsx`.

```
npm run storybook:web
```

Then, go to http://localhost:6006 to see your stories. Any changes you make to code will automatically refresh the browser.

If you are rendering React components that require a backend (e.g. because the component makes GraphQL API requests) then you should also run `server.ts` in VS Code before running storybook. It is recommended to use the `server.ts (no restart)` run configuration.

## Project Structure & HOWTOs

- `web`: runs code in the browser (React application). In production, this code is "bundled" into a single `bundle.js` file and served by the backend. It is sourced by the HTML served at `/app`.
- `server`: runs code on Node.js (Express server, GraphQL API). In production, this code may run in ECS or on AWS Lambda, depending on how you deploy it. Serves:
  - `/app`: React (client & server rendered) application, static assets
  - `/graphql`: GraphQL API
  - `/graphqlsubscription`: GraphQL API for subscriptions (over websocket)
  - `/api/:function`: non-graphql/REST APIs (e.g. RPCs)
- `common`: code that may be imported by either `web` or `server` projects. Must be runnable in both server and browser contexts.
- `public`: static assets bundled with the server and served at `/app`. Destination directory for build assets (e.g. `bundle.js`).
- `stories`: React components for [Storybook](https://storybook.js.org/)

### Database models & migrations

The project ships with an ORM and a migration manager. You may use the ORM or write raw SQL statements or both.

Define your ORM models in `server/src/entities`. Tables will automatically get created. See [TypeORM docs](https://typeorm.io/#/) for details.

Define migrations in `server/src/db/migrations`. They will automatically get run before your server starts. The starter project ships with an initial migration. Add new migrations by checking in additional migration files using the naming convention `VX.X__Description.sql`. The server only runs migrations which haven't already been run successfully. The server will fail before accepting connections if any migrations fail. You must manually correct the failed migrations to get the server into a healthy state.

## Deploy your app to AWS

### Create a Honeycomb account

[Create a free Honeycomb account](https://ui.honeycomb.io/signup?utm_source=product-trial-page&utm_medium=get-started-cta-self&utm_campaign=trial). Save your API key.

### Set AWS environment variables

The `terraform` commands to set up your AWS infrastucture require credentials. Your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` will be provided during the first lab session. Set these values on your environment (e.g. in `.bashrc` or `.zshrc`) or [follow the instructions for managing AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

```
export AWS_ACCESS_KEY_ID=<insert your key>
export AWS_SECRET_ACCESS_KEY=<insert your key>
export AWS_REGION=us-west-2
```

### Run terraform

Your terraform configuration is in `terraform/main.tf`. The default configuration includes:

- a MySQL database
- a Redis instance
- an appserver to run your Node.js server code
- an API Gateway routing traffic through a load balancer to your appserver

Open `terraform/main.tf` and **set your Honeycomb API key** (look for `<insert key here>`), then deploy your terraform resources:

```
cd terraform
terraform init
terraform apply
```

The `terraform apply` step will run code to create all the resources required to run your application. It will generate a `terraform.tfstate` file which it uses to track and manage the resources it has created. **Don't lose this file, and make sure to check it into your repo with git**.

#### De-provisioning resource

When you're done with a resource, simply delete or comment out the code and re-run `terraform apply`. :)

### Deploy your code

After provisioning your `terraform` resources run:

```
npm run deploy:init
```

This will package your server code and deploy it to your appserver. After a minute, go to https://**yourteamslug**.cloudcity.computer to see your app.

## Server scaling

Initially, your server will be deployed **as a single ECS task** running with minimally provisioned CPU and memory.

Over the quarter, you will be able to:

- horizontally scale appserver tasks (set desired run count)
- vertically scale appserver tasks (set desired CPU/memory)
- decompose services
  - via additional appservers running on ECS
  - via AWS lambda function(s)

### websockets

You may add websockets to your app to allow publishing data from your server to clients. Add this to your `main.tf`:

```
module "websocket_api" {
  source         = "./modules/websocket_api"
  appserver_host = module.webserver.host
}
```

Provision it with `terraform apply`. Then, tell your appserver how to communicate with your websocket API by setting the `ws_url` variable on your appserver:

```
  # uncomment to add graphql subscriptions, must make a websocket api first
  # ws_url = module.websocket_api.url
```

#### Troubleshooting: manual deployment trigger

Unfortunately `terraform` can't currently trigger deployments of websocket APIs. You must manually login to the AWS console to trigger a deployment of your websocket API.

![image](https://user-images.githubusercontent.com/1095573/93257685-13d00400-f752-11ea-93e0-881c3c83a09a.png)

### lambda

You may use lambda to decompose services from your appserver. You will also need to provision a lambda to run distributed load tests. Add this to your `main.tf`:

```
module "lambda" {
  source = "./modules/lambda"

  honeycomb_key = <insert your key>

  mysql_host = module.mysql.host
  redis_host = module.redis.host
}
```

Then provision it with `terraform apply`. You should also modify your `deploy-local.sh` and uncomment the section which deploys code to your newly provisioned lambda.

## Load testing

The project includes a load test runner which you may run from the `loadtest.ts` launch configuration:

![image](https://user-images.githubusercontent.com/1095573/94951019-67538900-0498-11eb-9d6e-f6f3f300f56d.png)

A load test is a sequence of `ArrivalPhase`s, each consisting of period of time when some # of users/second run a `UserScript`. A user script is a TypeScript function you write which simulates real user behavior.

The default script in `loadtest.ts` makes 3 GET requests to your appserver. Because your app is server rendered, your server will make GraphQL requests to itself to fetch the data necessary to render your app.

You may modify the script in `loadtest.ts` to make arbitrary GET or POST (e.g. GraphQL) requests to any endpoint of your server, using the `fetch` interface or `apolloClient`.

### Local execution vs. distributed execution

Your local computer can only put so much load on your server because there are limitations to how many TCP connections Node.js will concurrently let you make.

You may execute your user scripts locally or using a distributed exeucutor (AWS lambda). By default, the loadtest is set up for local execution.

### Viewing results

Your Honeycomb instrumentation will provide all the data visualizations you need. Login to Honeycomb to view your server metrics.

![image](https://user-images.githubusercontent.com/1095573/93257787-3d892b00-f752-11ea-8219-e1789b42cbf0.png)

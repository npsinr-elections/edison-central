# edison-central 
Central computer for displaying messages to the audience.
Note: Project is currently in development.

[![Build Status](https://travis-ci.org/npsinr-elections/edison-central.svg?branch=master)](https://travis-ci.org/npsinr-elections/edison-central)
[![dependencies Status](https://david-dm.org/npsinr-elections/edison-central/status.svg)](https://david-dm.org/npsinr-elections/edison-central)
[![devDependencies Status](https://david-dm.org/npsinr-elections/edison-central/dev-status.svg)](https://david-dm.org/npsinr-elections/edison-central?type=dev)

## Development Guide
(Only for developers working on project)
### Get the Project
Clone the project and install dependencies:
```
git clone https://github.com/npsinr-elections/edison-central.git
npm install
npm install --dev
```

### Building the project
To build the project, run:(requires gulp-cli to be installed)
```
npm run build
```
This build the project to the `build` directory in the root of the project.
Note: Check src/gulpfile.js for more gulp tasks.

To build executables for the project, run:
```
npm run dist
```
This generated windows and linux executables to the `dist` directory.

Also, to run the linter for the project, use:
```
npm run lint
```
(VSCode should do this for you automatically while you code)

Build Note:
1. The gulp task will bundle client sides scripts in src/clients/assets/scripts only if they are defined as an entry point in clientTsBuilders() in ./gulpfile.js

### Running the project
To run the server:
```
npm run server
```

Optionally, during development use:
```
npm run dev
```

This will automatically restart the server when any file in ./build is changed.

## Conventions:
1. Use [semantic commit messages](https://seesparkbox.com/foundry/semantic_commit_messages)
2. Comment code when intention not obvious.
3. Don't use javascript in ./src. Only code typescript.
4. Ensure tslint is used before every commit. Recommend to use VSCode editor (with [tslint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension) to automate this.
5. Always code only in the src directory, ./build is ONLY meant for built files and is ignored by the gitignore.
6. All express routes returning a response must comply with [JSON API](http://jsonapi.org/format/)
7. On the client side, prefer jquery $ methods over equivalent JS functions where possible. 
8. Classes and functions must be documented with [JSDoc](http://usejsdoc.org/).

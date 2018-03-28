# edison-central
Central computer for displaying messages to the audience.
Note: Project is currently in development.

## Development Guide
(Only for developers working on project)
### Get the Project
Clone the project and install dependencies:
```
git clone https://github.com/npsinr-elections/edison-central.git
npm install
npm install --dev
npm install -g typescript tslint gulp-cli nodemon
```

### Building the project
To build the project, run:(requires gulp-cli to be installed)
```
npm run build
```
Check src/gulpfile.js for more gulp tasks.
The project is built to ./build

Build Note:
1. The gulp task will bundle client sides scripts in src/clients/assets/scripts only if they are defined as an entry point in clientTsBuilders() in ./gulpfile.js

### Running the project
To run the server:
```
npm run server
```

Optionally, during development use: (requires nodemon to be installed)
```
npm run dev
```

This will automatically restart the server when any file in ./build is changed.

## Conventions:
1. Use [semantic commit messages](https://seesparkbox.com/foundry/semantic_commit_messages)
2. Comment code when intention not obvious.
3. Don't use javascript in ./src. Only code typescript.
4. Ensure tslint is used before every commit. Recommend to use VSCode editor (with tslint extension) to automate this.
5. Always code only in the src directory, ./build is ONLY meant for built files and is ignored by the gitignore
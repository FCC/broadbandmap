# NBM2

### Local Setup
Prerequisites: Node.js (>=6.x), npm version 3+ and Git.

1. Clone the repository.

2. Install node modules.  

   ```
   npm install
   ```

3. Test the app. 

   Unit and End-to-end tests
   ```
   npm test
   ```

   Unit tests
   ```
   npm run unit
   ```
   
   End-to-end test
   ```
   npm run e2e
   ```
   
   Lint
   ```
   npm run lint
   ```
   
4. Run the app.

   Local
   ```
   npm start
   ```   

### Deployment
1. Set the assets path in ./config/index.js based on environment (DEV, ST, AT)
   ```
   assetsPublicPath: 'http://nelson:7028/nbm2/DEV/'
   ```
   
2. Build the app.
   ```
   npm run build
   ```   
3. Copy files from the ```dist``` folder to ```nelson/nbm2/[environment]```.

   
### Project Info
[NBM2 JIRA Project](https://jira.fcc.gov/browse/GISNBM2/)

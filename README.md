# NBM2

### Local Setup
Prerequisites: Node.js (>=6.x), npm version 3+ and Git.

1. Clone the repository.

2. Install node modules.  

   ```
   npm install
   ```

3. Run the app.

   Local
   ```
   npm start
   ```   

### Deployment
1. Set the assets path in ./config/index.js based on environment (DEV, ST, AT)
   ```
   assetsPublicPath: 'https://broadbandmap.fcc.gov/'
   ```
   
2. Build the app.
   ```
   npm run build
   ```   
3. Copy files from the ```dist``` folder and create a .zip file (PROD-East.zip).

4. Copy the .zip file to ```K:\Projects\DevOps\NBM```.

5. Request CM ticket for deployment.

   
### Project Info
[NBM2 JIRA Project](https://jira.fcc.gov/browse/GISNBM2/)

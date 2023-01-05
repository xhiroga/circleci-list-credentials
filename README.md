# circleci-list-credentials
Listing up CircleCI Credentials

## How to run


### 1. Get CircleCI API Token



1. Go [Personal API Tokens](https://app.circleci.com/settings/user/tokens) and create new token.
2. `cp .env.sample .env` and paste your API Token.

### 2. List up projects

Copying projects name like this.

https://user-images.githubusercontent.com/13391129/210705946-31dfbaf8-6abf-4590-ae36-98a049fcad0c.mov

After that, save `projects.txt`. (`Set Up Project` will be ignored)

### 3. Run script

```shell
npm i
npm run app > logs/credentials.log
```


### (Optional) Deactivate CircleCI API Token

  


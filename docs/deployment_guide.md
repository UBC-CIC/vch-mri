# Requirements
Before you deploy, you must have the following in place:
*  [AWS Account](https://aws.amazon.com/account/) 
*  [GitHub Account](https://github.com/) 
*  [AWS CLI](https://aws.amazon.com/cli/) 
*  [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) 
*  [Amplify CLI installed and configured](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#quickstart) 

# Step 1: Back-end deployment

1. Store the database username and password at Systems Manager Parameter Store. **Make sure to replace DATABASENAME and DATABASEPWD with the respectives username and password you want to use for the database**.
```bash
aws ssm put-parameter --name "/mri-sched/dbuser_ec2" --value "DATABASENAME" --type SecureString --overwrite
aws ssm put-parameter --name "/mri-sched/dbpwd_ec2" --value "DATABASEPWD" --type SecureString --overwrite
```

2. In this step we will execute AWS SAM guided configuration by running. 
```bash
sam deploy -g --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
```

3. Provide the stack name, region and the key-pair name. For all the other questions, please accept the default answers or select *Y*. Below an example:

```
Configuring SAM deploy
======================

	Looking for config file [samconfig.toml] :  Not found

	Setting default arguments for 'sam deploy'
	=========================================
	Stack Name [sam-app]: mri-sched
	AWS Region [us-east-1]: [Your-AWS-REGION]
	Parameter CidrBlockVpcParameter [10.0.0.0/16]:
	Parameter PrivateSubnetAParameter [10.0.1.0/24]:
	Parameter PublicSubnetAParameter [10.0.2.0/24]:
	Parameter DBInstanceTypeParameter [t3.medium]:
	Parameter AMIID [/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2]:
	#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
	Confirm changes before deploy [y/N]: y
	#SAM needs permission to be able to create roles to connect to the resources in your template
	Allow SAM CLI IAM role creation [Y/n]: y
	Preprocess may not have authorization defined, Is this okay? [y/N]: y
	QueryRules may not have authorization defined, Is this okay? [y/N]: y
	QuerySpellchecker may not have authorization defined, Is this okay? [y/N]: y
	QueryConjunctions may not have authorization defined, Is this okay? [y/N]: y
	QueryWeights may not have authorization defined, Is this okay? [y/N]: y
	QuerySpecialtyTags may not have authorization defined, Is this okay? [y/N]: y
	DataResults may not have authorization defined, Is this okay? [y/N]: y
	Save arguments to configuration file [Y/n]: y
	SAM configuration file [samconfig.toml]:
	SAM configuration environment [default]:
```

4. Confirm the deployment and wait for the stack to be created.



# Step 2: Front-end deployment

1. Click on the **Deploy to Amplify Console** button below and follow the instructions:

<a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/vch-mri">
    <img src="https://oneclick.amplifyapp.com/button.svg" alt="Deploy to Amplify Console">
</a>


Connect to GitHub

Deploy th App (Create a new role - amplifyconsole-backend-role) 

This process 
Forks the repo into you github account, build and deploy the frontend solution 





1.  Clone and Fork this solution repository.
    If you haven't configured Amplify before, configure the Amplify CLI in your terminal as follows:
```bash
amplify configure
```

2.  In a terminal from the project root directory, enter the following command selecting the IAM user of the AWS Account you will deploy this application from. (accept all defaults):

```bash
amplify init
```

3.  Deploy the resourse to your AWS Account using the command:
```bash
amplify push
```

4. Log into the AWS Management Console.
5. Select AWS Amplify and select the **mri-sched**
6. At the *Frontend environments* tab connect to your github account poiting to the forked repo. More informatoin at https://docs.aws.amazon.com/amplify/latest/userguide/deploy-backend.html

# Fagprøve app
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Fagprøve app](#fagprøve-app)
  - [Getting Started](#getting-started)
    - [Install dependencies](#install-dependencies)
    - [Run the CAP service](#run-the-cap-service)
    - [To run the UI5 app](#to-run-the-ui5-app)
    - [To run the Cypress studio app](#to-run-the-cypress-studio-app)
    - [Data model](#data-model)

<!-- /code_chunk_output -->



## Getting Started
This is a application for geting a overview of your employee's to takin better choisess when planing acrose your organisation.

### Install dependencies
Install all the dependencies in the progject root directory and in the app directory ``app/``

### Run the CAP service
To run the app open a terminal in the root folder of the progject and run the comand under this starts the cap service on port `` 4008 `` that the UI5 app are going to use to do API-calls too.
```bash
npm run w
```

### To run the UI5 app 
To run the UI5 app oppen a terminal and navigate to the app  
```bash
cd app/
```
And to run the app and oppen it on the start page 
```bash
npm run start
```
For maintaining users it is done in the .cdsrc.json file 

<br>

### To run the Cypress studio app
To run the Cypress studio app oppen a terminal in the root progject folder and run the comand
```bash
npx cypress open
```


### Data model

This is how the data model looks like for the application

![image info](/images/DB%20relation%20schema.png)



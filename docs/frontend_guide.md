# VCH MRI Booking System - Frontend UI

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Logging in

Cognito is used for user authentication. Users will need to input their email address, name and a strong password to create an account.
After account creation, users will need to verify their account by inputting the 6-digit verification code that was sent to their provided email address before being able to log in to the system.

![alt text](images/frontend-login.png)

## Pages
All page tables in the frontend are sortable by column. Users can click on the header cells of a column to sort the rows
in ascending / descending order.

#### Book An MRI
Page containing MRI intake form for users to input data. Will display important information such as priority value,
contrast info and the relevant MRI rule ID on successful form submission.

![alt text](images/frontend-intake-form.png)

#### Rules
Page containing table of all defined MRI rules that define the algorithm. Users can add new rules and modify them, and
can also activate and deactivate them using the toggle on the left side of the row.

![alt text](images/frontend-rules-table.png)

#### Results
Page containing table of all stored MRI booking results in the database. Users can use the table pagination to navigate
through pages of results; each page contains 50 rows. Users can also use the search bar to request a specific result by reqCIO.

Users can also view any additional information regarding a MRI booking result by clicking on the info button on the right
side of its row. Users may also change priority and contrast values for a certain MRI booking result using the row
dropdowns if they wish.

![alt text](images/frontend-results-table.png)

#### Synonyms
Page containing table of all defined synonym relations in the PostgreSQL synonym dictionary, stored in the
`thesaurus_medical.ths` file in the Amplify S3 bucket. Users can add, modify and delete synonym relations. In the add and
modify synonym views, users will type a word/phrase in the first input field. Users can input synonyms in the second
input field by typing a word/phrase and then pressing the Enter key to confirm the synonym. Synonyms will show up as deletable 
tags below the input fields. With this layout, you can easily define one or even multiple synonyms for a certain word/phrase.

![alt text](images/frontend-synonyms-table.png)

#### Spellchecker
Page containing table of all defined words in the spellcheck dictionary. Users can add frequently misspelled medical
words here, or they can also delete them.

#### Word Weights
Page containing table of all defined weight mappings to medical words. Possible weights are A, B, C, and D, from highest
to lowest. Users can add word / weight mappings, modify the weight of a certain word from the dropdown, or delete them.

#### Conjunctions
Page containing table of all mappings of medical abbreviations to their respective definitions. Users can add, modify or delete
medical abbreviations here.

#### Specialty Exams
Page containing table of defined specialty medical exams to be considered by the rules-based algorithm. Users can add
or delete specialty exams here.
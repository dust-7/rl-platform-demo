# Regulatory and Licensing Platform

This is a demo system for a Software Engineering assessment.

## How to Run

1. Clone this repo and `cd` into repo folder.
2. Install node packages with `npm install`.
3. For best performance:
   - build with `npm run build`,
   - then start the app with `npm start`.
4. Alternatively, running the dev build also works: `npm run dev`
5. Access the web app by navigating to `http://localhost:3000`.

## Basic Walkthrough

1. Log in as Adam (Operator).
2. Create a new application.
3. Fill in all fields, then press Submit Application.
4. Sign out of the account.
5. Log in as Brenda (Officer).
6. Review the application.
7. ...

## AI Usage

This app was built with agentic coding assistance. I use a local setup.

- **Inference program:** Llama.cpp
- **LLM:** Qwen 3.6 35B A3B
- **Agent harness:** Pi Coding Agent

Prompt example:
```
@src/app/(main)/applications/new/page.tsx consists of a form allowing users with role "Operator" to submit a license application. Upon submission, form data needs to be stored in the data type referenced by `FieldOperatorSchema` in @src\lib\db\schema.ts. Plan this change, and ask me for clarification if there are ambiguities.
```

My workflow consists of me breaking down the requirements into small features, then prompting the agent to build each feature one by one. After each feature is built, I check through all line changes, then prompt the agent for fixes, or make minor fixes by hand. When one feature is done, I store the changes in a git commit, then move on to build the next feature.

The AI agent can sometimes generate inaccurate code when it does not have full context of the codebase. This can be worked around by specifically prompting the agent to refererence certain files or functions.

## What I would do next

Time was really limited for the scope of work I attempted. Towards the end, code got messy, and below expected standard for future maintainence. The first thing I would do next is to refactor the code for better readability. Unit tests are also missing, so that would be next in line.

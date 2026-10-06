# Scoping Proposal

## Project Description

The platform is a Regulatory and Licensing System used by government licensing officers and operators (businesses seeking licences) to manage the end-to-end application lifecycle.

## In Scope

Use Case 1 and Use Case 2 will be implemented per Acceptance Criteria, with the exception of a few features indicated under **Out of Scope** section.

## Out of Scope

| Use Case | Feature | MoSCoW | Reason |
| --- | --- | --- | --- |
| UC1 | Real-time AI verification status visible per uploaded document | Should have | Requires integration with AI OCR. |
| UC1 | Progress indicator showing overall completion status | Could have | Quality-of-life feature; cutting due to time constraints. |
| UC2 | AI verification results and flagged document issues are visible | Should have | Requires integration with AI OCR. |
| UC2 | Predefined comment templates available for common issues | Could have | Quality-of-life feature; cutting due to time constraints. |
| UC2 | Officer receives notification when case moves to "Pre-Site Resubmitted" | Should have | Requires integration with notification system. |
| UC3 | All | - | Cutting due to time constraints. |

A database, user session, and file storage system are mocked for simplicity.

## Technical Approach & Architecture

Tech Stack:
- React
- NextJS
- Supabase: Postgres, Auth, Storage
  - Mocked for simplicity
- Zod: data validation
- CSS: shadcn/ui

### Data Model

| user |||
| --- | --- | --- |
| id | int | PK |
| name | str ||
| role | str ||

| application |||
| --- | --- | --- |
| id | int | PK |
| form_id | int | FK |
| operator_id | int | FK |
| officer_id | int | FK |

| form |||
| --- | --- | --- |
| id | int | PK |
| fields | str | (stores list of field ids) |

| field |||
| --- | --- | --- |
| id | int | PK |
| type_id | int | FK|
| title | str ||

| field_type |||
| --- | --- | --- |
| id | int | PK |
| value | str | (text / file) |

| status |||
| --- | --- | --- |
| id | int | PK |
| internal | str ||
| officer | str ||
| operator | str ||

| field_operator |||
| --- | --- | --- |
| id | int | PK |
| field_id | int | FK |
| application_id | int | FK |
| value | str ||
| created_at | datetime ||

| field_officer |||
| --- | --- | --- |
| id | int | PK |
| field_id | int | FK |
| application_id | int | FK |
| comment | str ||
| created_at | datetime ||

| application_status |||
| --- | --- | --- |
| id | int | PK |
| application_id | int | FK |
| status_id | int | FK |
| created_by | int | FK |
| created_at | datetime ||
